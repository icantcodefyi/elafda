/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7,
    );

    const [
      totalUsers,
      bannedUsers,
      newUsersToday,
      newUsersThisWeek,
      totalPosts,
      deletedPosts,
      newPostsToday,
      newPostsThisWeek,
      totalComments,
      deletedComments,
      newCommentsToday,
      newCommentsThisWeek,
      totalReactions,
      recentActivity,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "BANNED" } }),
      0,
      0,

      db.post.count(),
      db.post.count({ where: { isDeleted: true } }),
      db.post.count({ where: { createdAt: { gte: startOfToday } } }),
      db.post.count({ where: { createdAt: { gte: startOfWeek } } }),

      (db as any).comment.count(),
      (db as any).comment.count({ where: { isDeleted: true } }),
      (db as any).comment.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      (db as any).comment.count({ where: { createdAt: { gte: startOfWeek } } }),

      (db as any).reaction.count(),

      Promise.all([
        db.user.findMany({
          select: {
            id: true,
            name: true,
            role: true,
          },
          orderBy: { name: "asc" },
          take: 5,
        }),
        db.post.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
            isDeleted: true,
            author: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        (db as any).comment.findMany({
          select: {
            id: true,
            content: true,
            createdAt: true,
            isDeleted: true,
            user: {
              select: {
                name: true,
              },
            },
            post: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]),
    ]);

    const [recentUsers, recentPosts, recentComments] = recentActivity;

    const combinedActivity = [
      ...recentUsers.map((user) => ({
        type: "user",
        id: user.id,
        title: `New user: ${user.name}`,
        createdAt: new Date(),
        status: user.role === "BANNED" ? "banned" : "active",
      })),
      ...recentPosts.map((post) => ({
        type: "post",
        id: post.id,
        title: `Post: ${post.title}`,
        createdAt: post.createdAt,
        status: post.isDeleted ? "deleted" : "active",
        author: post.author.name,
      })),
      ...recentComments.map((comment: any) => ({
        type: "comment",
        id: comment.id,
        title: `Comment on: ${comment.post.title}`,
        createdAt: comment.createdAt,
        status: comment.isDeleted ? "deleted" : "active",
        author: comment.user.name,
        preview: comment.content.slice(0, 100),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt as string | Date).getTime() -
          new Date(a.createdAt as string | Date).getTime(),
      )
      .slice(0, 10);

    const stats = {
      users: {
        total: totalUsers,
        banned: bannedUsers,
        active: totalUsers - bannedUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
      },
      posts: {
        total: totalPosts,
        active: totalPosts - deletedPosts,
        deleted: deletedPosts,
        newToday: newPostsToday,
        newThisWeek: newPostsThisWeek,
      },
      comments: {
        total: totalComments,
        active: totalComments - deletedComments,
        deleted: deletedComments,
        newToday: newCommentsToday,
        newThisWeek: newCommentsThisWeek,
      },
      engagement: {
        totalReactions,
        avgReactionsPerPost:
          totalPosts > 0
            ? Math.round((totalReactions / totalPosts) * 10) / 10
            : 0,
        avgCommentsPerPost:
          totalPosts > 0
            ? Math.round((totalComments / totalPosts) * 10) / 10
            : 0,
      },
      recentActivity: combinedActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
