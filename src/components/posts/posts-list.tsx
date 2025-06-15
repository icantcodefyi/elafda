/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { Eye, Loader, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePostsQuery } from "~/hooks/use-posts-query";
import { Button } from "~/components/ui/button";

export function PostsList() {
  const { data, isLoading, error, refetch } = usePostsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="text-muted-foreground mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Failed to load posts</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">No posts yet</h3>
        <p className="text-muted-foreground">
          Be the first to share an incident or story!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-2">
                  <Link
                    href={`/e-lafda/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Author and Meta */}
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.author.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {post.author.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <ReactionButtons postId={post.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
