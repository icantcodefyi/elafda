import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const addCollaboratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const removeCollaboratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Get collaborators for a post
export async function GET(
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

    // Find the post
    const post = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
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

    // Only post author can view collaborators
    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only the post author can view collaborators" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      collaborators: post.collaborators.map(collab => ({
        id: collab.id,
        userId: collab.userId,
        user: collab.user,
        createdAt: collab.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a collaborator to a post
export async function POST(
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

    const body = (await request.json()) as unknown;
    const { userId } = addCollaboratorSchema.parse(body);

    // Find the post
    const post = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Only post author can add collaborators
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the post author can add collaborators" },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent author from adding themselves as collaborator
    if (userId === post.authorId) {
      return NextResponse.json(
        { error: "Cannot add yourself as a collaborator" },
        { status: 400 }
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = await db.postCollaborator.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: userId,
        },
      },
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    // Add collaborator
    const collaborator = await db.postCollaborator.create({
      data: {
        postId: post.id,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      collaborator: {
        id: collaborator.id,
        userId: collaborator.userId,
        user: collaborator.user,
        createdAt: collaborator.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Remove a collaborator from a post
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

    const body = (await request.json()) as unknown;
    const { userId } = removeCollaboratorSchema.parse(body);

    // Find the post
    const post = await db.post.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Only post author can remove collaborators
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the post author can remove collaborators" },
        { status: 403 }
      );
    }

    // Find and remove the collaborator
    const collaborator = await db.postCollaborator.findUnique({
      where: {
        postId_userId: {
          postId: post.id,
          userId: userId,
        },
      },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    await db.postCollaborator.delete({
      where: {
        id: collaborator.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 