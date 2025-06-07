/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { PostRenderer } from "~/components/posts/post-renderer";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { CommentsSection } from "~/components/comments/comments-section";
import { db } from "~/server/db";
import { formatDistanceToNow } from "date-fns";
import type { TiptapContent } from "~/types/editor";

interface PostPageProps {
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

  if (!post) {
    return null;
  }

  // Increment view count
  await db.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return post;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader className="space-y-4">
            {/* Title */}
            <h1 className="text-3xl leading-tight font-bold">{post.title}</h1>

            {/* Author and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.image ?? undefined} />
                  <AvatarFallback>
                    {post.author?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {post.author?.name ?? "Unknown User"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">
                {post.views} views
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Post Content */}
            <PostRenderer
              content={post.description as unknown as TiptapContent}
            />

            {/* Reactions */}
            <div className="border-t pt-4">
              <ReactionButtons postId={post.id} />
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentsSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
