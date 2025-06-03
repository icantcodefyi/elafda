import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema for Twitter account updates
const twitterAccountUpdateSchema = z.object({
  username: z.string().optional(),
  displayName: z.string().optional(),
  profileImage: z.string().url().optional(),
  isVerified: z.boolean().optional(),
  followerCount: z.number().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET handler for fetching a single Twitter account
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id;
    
    // Get the Twitter account
    const account = await db.twitterAccount.findUnique({
      where: { id: accountId },
    });
    
    if (!account) {
      return NextResponse.json({ error: "Twitter account not found" }, { status: 404 });
    }
    
    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error fetching Twitter account:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter account" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a Twitter account
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
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update Twitter accounts" },
        { status: 403 }
      );
    }
    
    const accountId = params.id;
    
    // Check if account exists
    const existingAccount = await db.twitterAccount.findUnique({
      where: { id: accountId },
    });
    
    if (!existingAccount) {
      return NextResponse.json({ error: "Twitter account not found" }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = twitterAccountUpdateSchema.parse(body);
    
    // Check if username is being updated and if it already exists
    if (validatedData.username && validatedData.username !== existingAccount.username) {
      const usernameExists = await db.twitterAccount.findFirst({
        where: {
          username: validatedData.username,
          id: { not: accountId },
        },
      });
      
      if (usernameExists) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
    }
    
    // Update Twitter account in database
    const updatedAccount = await db.twitterAccount.update({
      where: { id: accountId },
      data: validatedData,
    });
    
    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error updating Twitter account:", error);
    return NextResponse.json(
      { error: "Failed to update Twitter account" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a Twitter account
export async function DELETE(
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
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete Twitter accounts" },
        { status: 403 }
      );
    }
    
    const accountId = params.id;
    
    // Check if account exists
    const existingAccount = await db.twitterAccount.findUnique({
      where: { id: accountId },
    });
    
    if (!existingAccount) {
      return NextResponse.json({ error: "Twitter account not found" }, { status: 404 });
    }
    
    // Check if account is used in any posts
    const postAccountCount = await db.postAccount.count({
      where: { accountId },
    });
    
    if (postAccountCount > 0) {
      // Instead of deleting, mark as inactive
      const updatedAccount = await db.twitterAccount.update({
        where: { id: accountId },
        data: { isActive: false },
      });
      
      return NextResponse.json({
        account: updatedAccount,
        message: "Account marked as inactive because it's used in posts",
      });
    }
    
    // Delete Twitter account from database
    await db.twitterAccount.delete({
      where: { id: accountId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Twitter account:", error);
    return NextResponse.json(
      { error: "Failed to delete Twitter account" },
      { status: 500 }
    );
  }
} 