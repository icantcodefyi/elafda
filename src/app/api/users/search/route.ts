import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const searchUsersSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().min(1).max(20).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = searchParams.get("limit");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const { q, limit: parsedLimit } = searchUsersSchema.parse({
      q: query,
      limit: limit ?? "10",
    });

    // Search users by name or email
    const users = await db.user.findMany({
      where: {
        AND: [
          {
            role: {
              not: "BANNED", // Exclude banned users
            },
          },
          {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: [
        {
          name: "asc",
        },
        {
          email: "asc",
        },
      ],
      take: parsedLimit,
    });

    // Filter out the current user from results
    const filteredUsers = users.filter(user => user.id !== session.user.id);

    return NextResponse.json({
      users: filteredUsers,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 