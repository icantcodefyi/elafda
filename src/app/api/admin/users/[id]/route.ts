import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema for user updates
const userUpdateSchema = z.object({
  isAdmin: z.boolean().optional(),
});

// GET handler for fetching a single user (admin only)
export async function GET(
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
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can access user details" },
        { status: 403 }
      );
    }
    
    const userId = params.id;
    
    // Get the user with related data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        createdPosts: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        approvedPosts: {
          take: 10,
          orderBy: { approvedAt: "desc" },
        },
        _count: {
          select: {
            createdPosts: true,
            approvedPosts: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a user (admin only)
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
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!currentUser?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update users" },
        { status: 403 }
      );
    }
    
    const userId = params.id;
    
    // Prevent self-demotion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot modify your own admin status" },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = userUpdateSchema.parse(body);
    
    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
} 