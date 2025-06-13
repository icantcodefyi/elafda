import { readFileSync } from "node:fs";
import { generateOGImage } from "./og";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

const font = readFileSync("public/fonts/Inter-Regular.ttf");
const fontSemiBold = readFileSync("public/fonts/Inter-SemiBold.ttf");
const fontBold = readFileSync("public/fonts/Inter-Bold.ttf");

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

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  // Get the first tag or use a default
  const tag = post.tags.length > 0 ? post.tags[0]! : "e-lafda";

  return generateOGImage({
    primaryTextColor: "rgb(240,240,240)",
    title: post.title,
    description: post.lore ?? "Check out this e-lafda discussion",
    tag: tag,
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

export const alt = "E-Lafda Post";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function generateStaticParams(): Promise<
  {
    id: string;
  }[]
> {
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
}
