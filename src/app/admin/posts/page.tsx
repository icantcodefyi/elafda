"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  AlertTriangle,
  Search,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  tags: string[];
  views: number;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
  };
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    post: Post | null;
    type: "soft" | "hard" | null;
  }>({
    open: false,
    post: null,
    type: null,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        showDeleted: showDeleted.toString(),
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = (await response.json()) as PostsResponse;
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.post || !deleteDialog.type) return;

    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: deleteDialog.post.id,
          type: deleteDialog.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove from local state if hard delete, or update if soft delete
      if (deleteDialog.type === "hard") {
        setPosts(posts.filter((post) => post.id !== deleteDialog.post!.id));
      } else {
        setPosts(
          posts.map((post) =>
            post.id === deleteDialog.post!.id
              ? {
                  ...post,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                }
              : post,
          ),
        );
      }

      setDeleteDialog({ open: false, post: null, type: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleRestore = async (postId: string) => {
    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore post");
      }

      // Update local state
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, isDeleted: false, deletedAt: null, deletedBy: null }
            : post,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore post");
    }
  };

  useEffect(() => {
    void fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, showDeleted]);

  const openDeleteDialog = (post: Post, type: "soft" | "hard") => {
    setDeleteDialog({ open: true, post, type });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Error loading posts</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => void fetchPosts()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Post Management</h2>
          <p className="text-muted-foreground">
            Manage posts and content moderation
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Search by title or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="show-deleted">Show deleted posts</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({pagination.total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-lg border p-4 ${post.isDeleted ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Link
                          href={`/e-lafda/${post.id}`}
                          className="font-medium hover:underline"
                        >
                          {post.title}
                        </Link>
                        {post.isDeleted && (
                          <Badge variant="destructive">Deleted</Badge>
                        )}
                      </div>

                      <div className="mb-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image ?? ""} />
                            <AvatarFallback>
                              {(post.author.name ?? post.author.email ?? "U")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {post.author.name ?? "Unnamed User"}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(post.createdAt))} ago
                        </span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                        <span>{post._count.comments} comments</span>
                        <span>{post._count.reactions} reactions</span>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
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

                    <div className="flex items-center gap-2">
                      {post.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleRestore(post.id)}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Restore
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(post, "soft")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Soft Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(post, "hard")}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hard Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-muted-foreground text-sm">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total} posts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, post: null, type: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {deleteDialog.type === "hard"
                ? "permanently delete"
                : "soft delete"}{" "}
              &quot;{deleteDialog.post?.title}&quot;?
              {deleteDialog.type === "hard" && (
                <div className="text-destructive mt-2">
                  This action cannot be undone. The post will be permanently
                  removed from the database.
                </div>
              )}
              {deleteDialog.type === "soft" && (
                <div className="mt-2">
                  The post will be hidden from users but can be restored later.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, post: null, type: null })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleteDialog.type === "hard"
                ? "Permanently Delete"
                : "Soft Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
