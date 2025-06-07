/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const reactionSchema = z.object({
  postId: z.string(),
  type: z.enum(["LIKE", "DISLIKE", "FIRE", "HEART", "CRY"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as unknown;
    const { postId, type } = reactionSchema.parse(body);

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Upsert reaction (create or update existing)
    const reaction = await (db as any).reaction.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
      update: {
        type: type,
      },
      create: {
        userId: session.user.id,
        postId: postId,
        type: type,
      },
    });

    return NextResponse.json(reaction);
  } catch (error) {
    console.error("Error creating/updating reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    // Delete reaction
    await (db as any).reaction.delete({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    // Get reaction counts for the post
    const reactions = await (db as any).reaction.groupBy({
      by: ["type"],
      where: {
        postId: postId,
      },
      _count: {
        type: true,
      },
    });

    // Get user's reaction if authenticated
    const session = await auth();
    let userReaction = null;

    if (session?.user) {
      userReaction = await (db as any).reaction.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId,
          },
        },
      });
    }

    // Format response
    const reactionCounts = reactions.reduce(
      (
        acc: Record<string, number>,
        reaction: { type: string; _count: { type: number } },
      ) => {
        acc[reaction.type] = reaction._count.type;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      counts: reactionCounts,
      userReaction: userReaction?.type ?? null,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
