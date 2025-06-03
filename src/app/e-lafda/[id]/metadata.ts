import type { Metadata } from "next"
import { mockELafdaData } from "~/lib/mock-data"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, you'd fetch the data here
  const elafda = params.id === "1" ? mockELafdaData : null

  if (!elafda) {
    return {
      title: "E-Lafda Not Found",
      description: "The requested e-lafda could not be found.",
    }
  }

  return {
    title: `${elafda.title} | E-Lafda`,
    description: elafda.description,
    keywords: elafda.tags.join(", "),
    authors: [{ name: elafda.author.displayName, url: `/@${elafda.author.username}` }],
    openGraph: {
      title: elafda.title,
      description: elafda.description,
      type: "article",
      publishedTime: elafda.createdAt,
      modifiedTime: elafda.updatedAt,
      authors: [elafda.author.displayName],
      tags: elafda.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: elafda.title,
      description: elafda.description,
      creator: `@${elafda.author.username}`,
    },
  }
} 