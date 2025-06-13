import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

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