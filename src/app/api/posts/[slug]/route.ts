import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { z } from "zod";
import { auth } from "~/server/auth";
import { generateSlug, generateUniqueSlug } from "~/lib/slug";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.any(),
  lore: z.string().optional(),
  tweetLinks: z.array(z.string().url()).default([]),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

const deletePostSchema = z.object({
  type: z.enum(["soft", "hard"]).default("soft"),
});

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    const post = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false, // Only show non-deleted posts
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // Return post with incremented view count
    const updatedPost = {
      ...post,
      views: post.views + 1,
    };

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    // Find the existing post
    const existingPost = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
        title: true,
        slug: true,
        collaborators: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user owns the post, is a collaborator, or is admin
    const isOwner = existingPost.authorId === session.user.id;
    const isCollaborator = existingPost.collaborators.some(
      collab => collab.userId === session.user.id
    );
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isCollaborator && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit posts you own or collaborate on" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as unknown;
    const validatedData = updatePostSchema.parse(body);

    // Check if title changed and generate new slug if needed
    let newSlug = existingPost.slug;
    if (validatedData.title !== existingPost.title) {
      const baseSlug = generateSlug(validatedData.title);
      
      // Check for existing slugs to ensure uniqueness (excluding current post)
      const existingPosts = await db.post.findMany({
        where: {
          slug: {
            startsWith: baseSlug,
          },
          id: {
            not: existingPost.id,
          },
        },
        select: {
          slug: true,
        },
      });
      
      const existingSlugs = existingPosts.map(post => post.slug);
      newSlug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Update the post
    const updatedPost = await db.post.update({
      where: { id: existingPost.id },
      data: {
        title: validatedData.title,
        slug: newSlug,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: validatedData.description,
        lore: validatedData.lore,
        tweetLinks: validatedData.tweetLinks,
        images: validatedData.images,
        tags: validatedData.tags,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { error: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    // Find the existing post
    const existingPost = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
        title: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if user owns the post or is admin
    if (existingPost.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own posts" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as unknown;
    const { type } = deletePostSchema.parse(body);

    // Only admins can hard delete
    if (type === "hard" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can permanently delete posts" },
        { status: 403 }
      );
    }

    if (type === "hard") {
      // Hard delete - completely remove from database
      await db.post.delete({
        where: { id: existingPost.id },
      });
    } else {
      // Soft delete - mark as deleted
      await db.post.update({
        where: { id: existingPost.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: type === "hard" ? "Post permanently deleted" : "Post deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 