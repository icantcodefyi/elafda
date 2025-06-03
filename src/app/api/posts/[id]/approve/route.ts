import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const approvalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "UNDER_REVIEW"]),
  approvalNote: z.string().optional(),
});

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
    
    // Check if user is an admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can approve posts" },
        { status: 403 }
      );
    }
    
    const postId = params.id;
    
    // Check if post exists
    const existingPost = await db.post.findUnique({
      where: { id: postId },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const { status, approvalNote } = approvalSchema.parse(body);
    
    // Update post with approval status
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        status,
        isApproved: status === "APPROVED",
        approvedBy: session.user.id,
        approvedAt: status === "APPROVED" ? new Date() : null,
        approvalNote,
      },
    });
    
    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error approving post:", error);
    return NextResponse.json(
      { error: "Failed to approve post" },
      { status: 500 }
    );
  }
} 