/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { Loader, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePostsQuery } from "~/hooks/use-posts-query";
import { Button } from "~/components/ui/button";
import { useState } from "react";

interface PostsListProps {
  initialPage?: number;
}

export function PostsList({ initialPage = 1 }: PostsListProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const postsPerPage = 10;

  const { data, isLoading, error, refetch } = usePostsQuery(
    currentPage,
    postsPerPage,
  );

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
  const pagination = data?.pagination;

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages } = pagination;
    const buttons = [];

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        className="h-8 w-8 rounded-full p-0"
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>,
    );

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);

    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={page === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>,
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="text-muted-foreground px-2">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    if (endPage < pages) {
      if (endPage < pages - 1) {
        buttons.push(
          <span key="ellipsis2" className="text-muted-foreground px-2">
            ...
          </span>,
        );
      }
      buttons.push(
        <Button
          key={pages}
          variant={page === pages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(pages)}
        >
          {pages}
        </Button>,
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        className="h-8 w-8 rounded-full p-0"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= pages}
      >
        <ChevronRight className="size-4" />
      </Button>,
    );

    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Posts List */}
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
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
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

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-2 py-4">
          <div className="flex items-center gap-1">
            {renderPaginationButtons()}
          </div>
          <div className="text-muted-foreground text-center text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} posts
          </div>
        </div>
      )}
    </div>
  );
}
