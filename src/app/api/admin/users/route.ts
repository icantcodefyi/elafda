import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// GET handler for fetching users (admin only)
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
        { error: "Only admins can access user management" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {
      where: {},
    };
    
    // Add filters if provided
    if (email) {
      filter.where.email = {
        contains: email,
        mode: "insensitive",
      };
    }
    
    if (name) {
      filter.where.name = {
        contains: name,
        mode: "insensitive",
      };
    }
    
    // Get total count for pagination
    const totalCount = await db.user.count({ where: filter.where });
    
    // Get users with pagination
    const users = await db.user.findMany({
      ...filter,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdPosts: true,
            approvedPosts: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      users,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 