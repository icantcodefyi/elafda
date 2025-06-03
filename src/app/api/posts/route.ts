import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

// Schema for post creation
const postCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  detailedStory: z.string().optional(),
  lafdaDate: z.string().transform((str) => new Date(str)),
  sourceLinks: z.array(z.string().url()).default([]),
  screenshots: z.array(z.string()).default([]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  category: z.enum([
    "POLITICS",
    "ENTERTAINMENT",
    "SPORTS",
    "BUSINESS",
    "TECHNOLOGY",
    "SOCIAL_MEDIA",
    "PERSONAL",
    "LEGAL",
    "OTHER",
  ]).default("OTHER"),
  tags: z.array(z.string()).default([]),
  accounts: z.array(z.object({
    twitterId: z.string(),
    username: z.string(),
    displayName: z.string(),
    role: z.enum([
      "MAIN_INVOLVED",
      "INVOLVED",
      "RESPONDED",
      "MENTIONED",
      "WITNESS",
    ]).default("INVOLVED"),
    description: z.string().optional(),
    profileImage: z.string().optional(),
    isVerified: z.boolean().default(false),
    followerCount: z.number().optional(),
    bio: z.string().optional(),
  })).default([]),
});

// GET handler for fetching posts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const severity = searchParams.get("severity");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = {
    where: {},
  };

  // Add filters if provided
  if (status) {
    filter.where.status = status;
  } else {
    // By default, only show approved posts to regular users
    const session = await auth();
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      filter.where.isApproved = true;
    }
  }

  if (category) {
    filter.where.category = category;
  }

  if (severity) {
    filter.where.severity = severity;
  }

  // Get total count for pagination
  const totalCount = await db.post.count({ where: filter.where });

  // Get posts with pagination
  const posts = await db.post.findMany({
    ...filter,
    skip,
    take: limit,
    orderBy: { lafdaDate: "desc" },
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
          account: true,
        },
      },
    },
  });

  return NextResponse.json({
    posts,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    },
  });
}

// POST handler for creating new posts
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = postCreateSchema.parse(body);
    
    // Extract accounts data
    const { accounts, ...postData } = validatedData;
    
    // Create post in database
    const post = await db.$transaction(async (prisma) => {
      // Create the post first
      const newPost = await prisma.post.create({
        data: {
          ...postData,
          createdBy: session.user.id,
          status: "PENDING",
        },
      });
      
      // Process Twitter accounts
      for (const accountData of accounts) {
        const { twitterId, username, displayName, role, description, ...twitterAccountData } = accountData;
        
        // Find or create Twitter account
        let twitterAccount = await prisma.twitterAccount.findUnique({
          where: { twitterId },
        });
        
        if (!twitterAccount) {
          twitterAccount = await prisma.twitterAccount.create({
            data: {
              twitterId,
              username,
              displayName,
              ...twitterAccountData,
            },
          });
        }
        
        // Create the relationship between post and account
        await prisma.postAccount.create({
          data: {
            postId: newPost.id,
            accountId: twitterAccount.id,
            role,
            description,
          },
        });
      }
      
      return newPost;
    });
    
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
} 