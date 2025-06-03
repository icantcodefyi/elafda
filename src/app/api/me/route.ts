import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET handler for fetching current user information
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            createdPosts: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get user's recent posts
    const recentPosts = await db.post.findMany({
      where: { createdBy: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        isApproved: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      user,
      recentPosts,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
} 