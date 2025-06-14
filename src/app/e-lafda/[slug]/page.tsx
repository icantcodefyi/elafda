import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { PostClientWrapper } from "~/components/posts/post-client-wrapper";
import { EditPostButton } from "~/components/posts/edit-post-button";
import { DeletePostButton } from "~/components/posts/delete-post-button";
import { db } from "~/server/db";
import { formatDistanceToNow } from "date-fns";
import type { TiptapContent } from "~/types/editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faClock,
  faUser,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { siteConfig } from "~/site-config";
import type { Metadata } from "next";

interface PostPageProps {
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

  if (!post) {
    return null;
  }

  await db.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return {
    ...post,
    views: post.views + 1,
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.tags.length > 0 ? post.tags.join(", ") : siteConfig.description,
    openGraph: {
      title: post.title,
      description: post.tags.length > 0 ? post.tags.join(", ") : siteConfig.description,
      url: `${siteConfig.url}/e-lafda/${post.slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/e-lafda/${post.slug}/og`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.tags.length > 0 ? post.tags.join(", ") : siteConfig.description,
      images: [`${siteConfig.url}/e-lafda/${post.slug}/og`],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const { slug } = await params;

    // Validate the slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      notFound();
    }

    const post = await getPost(slug);

    if (!post) {
      notFound();
    }

    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Back to Home Button */}
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors duration-200 hover:underline"
            >
              Back to Home
            </Link>

            {/* Main Post Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-6 pb-4">
                {/* Post Title */}
                <div className="space-y-3">
                  <h1 className="text-foreground text-2xl leading-tight font-bold tracking-tight">
                    {post.title}
                  </h1>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                        >
                          <FontAwesomeIcon
                            icon={faTag}
                            className="h-2.5 w-2.5"
                          />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-border/50" />

                {/* Author and Meta Information */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-border/20 h-10 w-10 ring-2">
                      <AvatarImage
                        src={post.author?.image ?? undefined}
                        alt={post.author?.name ?? "User avatar"}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-foreground font-medium">
                        {post.author?.name ?? "Anonymous User"}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions and View Count */}
                  <div className="flex items-center gap-3">
                    <EditPostButton postSlug={post.slug} authorId={post.authorId} />
                    <DeletePostButton 
                      postSlug={post.slug} 
                      postTitle={post.title} 
                      authorId={post.authorId} 
                    />
                    <div className="bg-muted/50 flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-muted-foreground h-3.5 w-3.5"
                      />
                      <span className="text-muted-foreground text-sm font-medium">
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-0">
                <PostClientWrapper
                  postId={post.id}
                  content={post.description as unknown as TiptapContent}
                />
              </CardContent>
            </Card>

            {/* Comments Section Card is now handled in PostClientWrapper */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in PostPage:", error);
    throw error; // Re-throw to trigger error boundary
  }
} 