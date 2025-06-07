/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const createCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    // Get all comments for the post with user info and vote counts
    const comments = await (db as any).comment.findMany({
      where: {
        postId,
        isDeleted: false, // Only show non-deleted comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        votes: {
          select: {
            type: true,
            userId: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get current user's votes if authenticated
    const session = await auth();
    const userVotes = session?.user
      ? await (db as any).commentVote.findMany({
          where: {
            userId: session.user.id,
            commentId: {
              in: comments.map((comment: any) => comment.id),
            },
          },
        })
      : [];

    // Process comments to include vote counts and user vote status
    const processedComments = comments.map((comment: any) => {
      const upvotes = comment.votes.filter(
        (vote: any) => vote.type === "UPVOTE",
      ).length;
      const downvotes = comment.votes.filter(
        (vote: any) => vote.type === "DOWNVOTE",
      ).length;
      const userVote = userVotes.find(
        (vote: any) => vote.commentId === comment.id,
      );

      return {
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        user: comment.user,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        userVote: userVote?.type || null,
        replyCount: comment._count.replies,
      };
    });

    return NextResponse.json(processedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as unknown;
    const { postId, content, parentId } = createCommentSchema.parse(body);

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await (db as any).comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        );
      }
    }

    // Create comment
    const comment = await (db as any).comment.create({
      data: {
        content,
        postId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Return comment with initial vote counts
    const processedComment = {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      user: comment.user,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      userVote: null,
      replyCount: comment._count.replies,
    };

    return NextResponse.json(processedComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
