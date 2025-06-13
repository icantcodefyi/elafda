import { readFileSync } from "node:fs";
import { type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { generateOGImage } from "../og";
import { db } from "~/server/db";

// Load fonts
const font = readFileSync("./src/app/e-lafda/[id]/fonts/Inter-Regular.ttf");
const fontSemiBold = readFileSync(
  "./src/app/e-lafda/[id]/fonts/Inter-SemiBold.ttf",
);
const fontBold = readFileSync("./src/app/e-lafda/[id]/fonts/Inter-Bold.ttf");

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const post = await db.post.findFirst({
    where: {
      id,
      isDeleted: false, // Only show non-deleted posts
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return post;
}

// Handle OG Image generation
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const post = await getPost(id);
  if (!post) notFound();

  return generateOGImage({
    primaryTextColor: "rgb(240,240,240)",
    title: post.title,
    description: post.tags.length > 0 ? post.tags.join(" • ") : "No tags",
    tag: post.author?.name ?? "anonymous",
    fonts: [
      {
        name: "Inter",
        data: font,
        weight: 400,
      },
      {
        name: "Inter",
        data: fontSemiBold,
        weight: 600,
      },
      {
        name: "Inter",
        data: fontBold,
        weight: 700,
      },
    ],
  });
}

// Generate static params for static generation
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const posts = await db.post.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    return posts.map((post) => ({
      id: post.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
