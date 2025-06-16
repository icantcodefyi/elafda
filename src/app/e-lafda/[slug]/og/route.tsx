import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { generateOGImage } from "../og";
import { db } from "~/server/db";


const font = readFileSync(join(process.cwd(), "src/app/e-lafda/[slug]/og/fonts/Inter-Regular.ttf"));
const fontSemiBold = readFileSync(
  join(process.cwd(), "src/app/e-lafda/[slug]/og/fonts/Inter-SemiBold.ttf"),
);
const fontBold = readFileSync(join(process.cwd(), "src/app/e-lafda/[slug]/og/fonts/Inter-Bold.ttf"));

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const post = await db.post.findFirst({
    where: {
      slug,
      isDeleted: false,
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

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  
  const post = await getPost(slug);
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

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const posts = await db.post.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        slug: true,
      },
    });

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
