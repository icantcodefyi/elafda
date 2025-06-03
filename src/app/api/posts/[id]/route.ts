import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// GET handler for fetching a single post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    // Get the post with all related data
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        postAccounts: {
          include: {
            account: true,
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Check if the post is approved or if the user is an admin
    if (!post.isApproved) {
      const session = await auth();
      if (!session?.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      });
      
      // If not admin and not the creator, deny access
      if (!user?.isAdmin && post.createdBy !== session.user.id) {
        return NextResponse.json(
          { error: "Post not approved yet" },
          { status: 403 }
        );
      }
    }
    
    // Increment view count
    await db.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
    
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Schema for post updates
const postUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  detailedStory: z.string().optional(),
  lafdaDate: z.string().transform((str) => new Date(str)).optional(),
  sourceLinks: z.array(z.string().url()).optional(),
  screenshots: z.array(z.string()).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  category: z.enum([
    "POLITICS",
    "ENTERTAINMENT",
    "SPORTS",
    "BUSINESS",
    "TECHNOLOGY",
    "SOCIAL_MEDIA",
    "PERSONAL",
    "LEGAL",
    "OTHER",
  ]).optional(),
  tags: z.array(z.string()).optional(),
});

// PATCH handler for updating a post
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const postId = params.id;
    
    // Check if post exists and if user has permission to edit
    const existingPost = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        createdBy: true,
        isApproved: true,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Check if user is the creator or an admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin && existingPost.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }
    
    // If post is already approved and user is not admin, prevent editing
    if (existingPost.isApproved && !user?.isAdmin) {
      return NextResponse.json(
        { error: "Cannot edit an approved post" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = postUpdateSchema.parse(body);
    
    // Update post in database
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        ...validatedData,
        // If admin is not the one updating, set status back to pending
        ...(user?.isAdmin ? {} : { status: "PENDING", isApproved: false, approvedBy: null, approvedAt: null }),
      },
    });
    
    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const postId = params.id;
    
    // Check if post exists and if user has permission to delete
    const existingPost = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        createdBy: true,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Check if user is the creator or an admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin && existingPost.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }
    
    // Delete post from database
    await db.post.delete({
      where: { id: postId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
} 