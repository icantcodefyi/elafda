/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const deletePostSchema = z.object({
  postId: z.string(),
  type: z.enum(["soft", "hard"]),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const showDeleted = searchParams.get("showDeleted") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }
    if (!showDeleted) {
      where.isDeleted = false;
    }

    // Get posts with author info and counts
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          tags: true,
          views: true,
          isDeleted: true,
          deletedAt: true,
          deletedBy: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as unknown;
    const { postId, type } = deletePostSchema.parse(body);

    if (type === "hard") {
      // Hard delete - completely remove from database
      await db.post.delete({
        where: { id: postId },
      });
    } else {
      // Soft delete - mark as deleted
      await db.post.update({
        where: { id: postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as unknown;
    const { postId } = z.object({ postId: z.string() }).parse(body);

    // Restore soft-deleted post
    const restoredPost = await db.post.update({
      where: { id: postId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });

    return NextResponse.json(restoredPost);
  } catch (error) {
    console.error("Error restoring post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
