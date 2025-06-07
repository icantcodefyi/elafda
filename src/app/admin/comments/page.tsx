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
  MessageSquare,
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

interface Comment {
  id: string;
  content: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  post: {
    id: string;
    title: string;
  };
  _count: {
    replies: number;
    votes: number;
  };
}

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
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
    comment: Comment | null;
    type: "soft" | "hard" | null;
  }>({
    open: false,
    comment: null,
    type: null,
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        showDeleted: showDeleted.toString(),
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = (await response.json()) as CommentsResponse;
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.comment || !deleteDialog.type) return;

    try {
      const response = await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: deleteDialog.comment.id,
          type: deleteDialog.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove from local state if hard delete, or update if soft delete
      if (deleteDialog.type === "hard") {
        setComments(
          comments.filter((comment) => comment.id !== deleteDialog.comment!.id),
        );
      } else {
        setComments(
          comments.map((comment) =>
            comment.id === deleteDialog.comment!.id
              ? {
                  ...comment,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                }
              : comment,
          ),
        );
      }

      setDeleteDialog({ open: false, comment: null, type: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const handleRestore = async (commentId: string) => {
    try {
      const response = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore comment");
      }

      // Update local state
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, isDeleted: false, deletedAt: null, deletedBy: null }
            : comment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to restore comment",
      );
    }
  };

  useEffect(() => {
    void fetchComments();
  }, [page, search, showDeleted]);

  const openDeleteDialog = (comment: Comment, type: "soft" | "hard") => {
    setDeleteDialog({ open: true, comment, type });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">
              Error loading comments
            </h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => void fetchComments()} className="mt-4">
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
          <h2 className="text-2xl font-bold">Comment Management</h2>
          <p className="text-muted-foreground">
            Manage comments and discussions
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
                placeholder="Search by content or user..."
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
              <Label htmlFor="show-deleted">Show deleted comments</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({pagination.total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-lg border p-4 ${comment.isDeleted ? "bg-muted/50" : ""}`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.user.image ?? ""} />
                          <AvatarFallback>
                            {(comment.user.name ?? comment.user.email ?? "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {comment.user.name ?? "Unnamed User"}
                        </span>
                        {comment.isDeleted && (
                          <Badge variant="destructive">Deleted</Badge>
                        )}
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-muted-foreground mb-1 text-sm">
                          Comment on:{" "}
                          <Link
                            href={`/e-lafda/${comment.post.id}`}
                            className="text-primary hover:underline"
                          >
                            {comment.post.title}
                          </Link>
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm">
                          {comment.content.length > 200
                            ? `${comment.content.slice(0, 200)}...`
                            : comment.content}
                        </div>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {comment._count.replies} replies
                        </span>
                        <span>{comment._count.votes} votes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {comment.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleRestore(comment.id)}
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
                              onClick={() => openDeleteDialog(comment, "soft")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Soft Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(comment, "hard")}
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
                    of {pagination.total} comments
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
          setDeleteDialog({ open, comment: null, type: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {deleteDialog.type === "hard"
                ? "permanently delete"
                : "soft delete"}{" "}
              this comment?
              {deleteDialog.type === "hard" && (
                <div className="text-destructive mt-2">
                  This action cannot be undone. The comment will be permanently
                  removed from the database.
                </div>
              )}
              {deleteDialog.type === "soft" && (
                <div className="mt-2">
                  The comment will be hidden from users but can be restored
                  later.
                </div>
              )}
              <div className="bg-muted mt-2 rounded p-3 text-sm">
                {deleteDialog.comment?.content.slice(0, 100)}...
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, comment: null, type: null })
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
