import type { Metadata } from "next";
import { db } from "~/server/db";

async function getPost(id: string) {
  try {
    const post = await db.post.findFirst({
      where: {
        id,
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
  } catch (error) {
    console.error("Error fetching post for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
      return {
        title: "E-Lafda Not Found",
        description: "The requested e-lafda could not be found.",
      };
    }

    return {
      title: `${post.title} | E-Lafda`,
      description: post.lore ?? "Check out this e-lafda discussion",
      keywords: post.tags?.join(", ") ?? "",
      authors: [
        { name: post.author.name ?? "Anonymous", url: `/@${post.author.name}` },
      ],
      openGraph: {
        title: post.title,
        description: post.lore ?? "Check out this e-lafda discussion",
        type: "article",
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: [post.author.name ?? "Anonymous"],
        tags: post.tags ?? [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.lore ?? "Check out this e-lafda discussion",
        creator: `@${post.author.name ?? "anonymous"}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "E-Lafda",
      description: "Discussion platform for engaging conversations",
    };
  }
}
