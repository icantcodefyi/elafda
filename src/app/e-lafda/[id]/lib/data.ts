import { db } from "~/server/db";
import { notFound } from "next/navigation";

export async function getPostById(id: string) {
  try {
    const post = await db.post.findFirst({
      where: {
        id,
        isApproved: true, // Only show approved posts
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        postAccounts: {
          include: {
            account: {
              select: {
                username: true,
                displayName: true,
                profileImage: true,
                isVerified: true,
              },
            },
          },
        },
        _count: {
          select: {
            postAccounts: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    // Increment view count
    await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getRelatedPosts(postId: string, category: string, tags: string[], limit = 5) {
  try {
    const relatedPosts = await db.post.findMany({
      where: {
        id: { not: postId },
        isApproved: true,
        OR: [
          { category },
          {
            tags: {
              hasSome: tags,
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            postAccounts: true,
          },
        },
      },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return relatedPosts;
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

export async function getCommentsCount(postId: string) {
  // For now, return a mock count since we don't have comments in our schema yet
  // You can implement a Comment model later and replace this
  return Math.floor(Math.random() * 50) + 5;
}

export type PostWithDetails = NonNullable<Awaited<ReturnType<typeof getPostById>>>;
export type RelatedPost = Awaited<ReturnType<typeof getRelatedPosts>>[0]; 