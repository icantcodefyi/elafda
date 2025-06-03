import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema for Twitter account creation/update
const twitterAccountSchema = z.object({
  twitterId: z.string(),
  username: z.string(),
  displayName: z.string(),
  profileImage: z.string().url().optional(),
  isVerified: z.boolean().default(false),
  followerCount: z.number().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET handler for fetching Twitter accounts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const twitterId = searchParams.get("twitterId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {
      where: {},
    };
    
    // Add filters if provided
    if (username) {
      filter.where.username = {
        contains: username,
        mode: "insensitive",
      };
    }
    
    if (twitterId) {
      filter.where.twitterId = twitterId;
    }
    
    // Get total count for pagination
    const totalCount = await db.twitterAccount.count({ where: filter.where });
    
    // Get Twitter accounts with pagination
    const accounts = await db.twitterAccount.findMany({
      ...filter,
      skip,
      take: limit,
      orderBy: { username: "asc" },
    });
    
    return NextResponse.json({
      accounts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching Twitter accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter accounts" },
      { status: 500 }
    );
  }
}

// POST handler for creating new Twitter accounts
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is an admin (only admins can manually create Twitter accounts)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can create Twitter accounts directly" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = twitterAccountSchema.parse(body);
    
    // Check if account already exists
    const existingAccount = await db.twitterAccount.findFirst({
      where: {
        OR: [
          { twitterId: validatedData.twitterId },
          { username: validatedData.username },
        ],
      },
    });
    
    if (existingAccount) {
      return NextResponse.json(
        { error: "Twitter account already exists" },
        { status: 409 }
      );
    }
    
    // Create Twitter account in database
    const account = await db.twitterAccount.create({
      data: validatedData,
    });
    
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error creating Twitter account:", error);
    return NextResponse.json(
      { error: "Failed to create Twitter account" },
      { status: 500 }
    );
  }
} 