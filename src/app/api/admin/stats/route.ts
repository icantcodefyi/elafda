import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET handler for fetching admin dashboard statistics
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is an admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can access dashboard statistics" },
        { status: 403 }
      );
    }
    
    // Get total counts
    const totalUsers = await db.user.count();
    const totalPosts = await db.post.count();
    const totalTwitterAccounts = await db.twitterAccount.count();
    
    // Get pending posts count
    const pendingPosts = await db.post.count({
      where: { status: "PENDING" },
    });
    
    // Get approved posts count
    const approvedPosts = await db.post.count({
      where: { status: "APPROVED" },
    });
    
    // Get rejected posts count
    const rejectedPosts = await db.post.count({
      where: { status: "REJECTED" },
    });
    
    // Get under review posts count
    const underReviewPosts = await db.post.count({
      where: { status: "UNDER_REVIEW" },
    });
    
    // Get posts by category
    const postsByCategory = await db.post.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });
    
    // Get posts by severity
    const postsBySeverity = await db.post.groupBy({
      by: ["severity"],
      _count: {
        id: true,
      },
    });
    
    // Get recent posts
    const recentPosts = await db.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    // Get recent users
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    
    // Get top viewed posts
    const topViewedPosts = await db.post.findMany({
      take: 5,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        views: true,
        createdAt: true,
      },
    });
    
    // Return all statistics
    return NextResponse.json({
      counts: {
        users: totalUsers,
        posts: totalPosts,
        twitterAccounts: totalTwitterAccounts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        underReviewPosts,
      },
      distribution: {
        postsByCategory,
        postsBySeverity,
      },
      recent: {
        posts: recentPosts,
        users: recentUsers,
        topViewedPosts,
      },
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
} 