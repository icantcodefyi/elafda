import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema for post voting
const voteSchema = z.object({
  type: z.enum(["upvote", "downvote"]),
});

// POST handler for voting on posts
export async function POST(
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
    
    // Check if post exists and is approved
    const existingPost = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        isApproved: true,
        upvotes: true,
        downvotes: true,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Only allow voting on approved posts
    if (!existingPost.isApproved) {
      return NextResponse.json(
        { error: "Cannot vote on unapproved posts" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const { type } = voteSchema.parse(body);
    
    // Update post vote count
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        upvotes: type === "upvote" ? { increment: 1 } : undefined,
        downvotes: type === "downvote" ? { increment: 1 } : undefined,
      },
      select: {
        id: true,
        upvotes: true,
        downvotes: true,
      },
    });
    
    return NextResponse.json({
      post: updatedPost,
      message: `Post ${type}d successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error voting on post:", error);
    return NextResponse.json(
      { error: "Failed to vote on post" },
      { status: 500 }
    );
  }
} 