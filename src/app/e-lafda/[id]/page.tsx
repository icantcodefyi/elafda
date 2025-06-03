import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { ELafdaHeader } from "./components/elafda-header";
import { ScreenshotGallery } from "./components/screenshot-gallery";
import { DetailedStory } from "./components/detailed-story";
import { RelatedPosts } from "./components/related-posts";
import { getPostById, getRelatedPosts, getCommentsCount } from "./lib/data";

interface ELafdaPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Metadata generation
export async function generateMetadata({ params }: ELafdaPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "E-Lafda Not Found",
      description: "The requested e-lafda could not be found.",
    };
  }

  return {
    title: `${post.title} | E-Lafda Directory`,
    description: post.description || "View this e-lafda in our directory",
    keywords: post.tags.join(", "),
    openGraph: {
      title: post.title,
      description: post.description || "",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || "",
    },
  };
}

export default async function ELafdaPage({ params }: ELafdaPageProps) {
  const { id } = await params;
  
  // Fetch all data in parallel
  const [post, commentsCount] = await Promise.all([
    getPostById(id),
    getCommentsCount(id),
  ]);

  if (!post) {
    notFound();
  }

  // Get related posts after we have the main post data
  const relatedPosts = await getRelatedPosts(post.id, post.category, post.tags);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <ELafdaHeader post={post} commentsCount={commentsCount} />
        
        <Separator className="my-8" />

        <Tabs defaultValue="story" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="evidence">
              Evidence ({post.screenshots.length + post.sourceLinks.length})
            </TabsTrigger>
            <TabsTrigger value="related">Related ({relatedPosts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="space-y-6">
            <DetailedStory 
              detailedStory={post.detailedStory} 
              lafdaDate={post.lafdaDate} 
            />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6">
            <ScreenshotGallery 
              screenshots={post.screenshots} 
              sourceLinks={post.sourceLinks} 
            />
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <RelatedPosts relatedPosts={relatedPosts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
