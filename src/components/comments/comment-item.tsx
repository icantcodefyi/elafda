"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { formatDistanceToNow } from "date-fns";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { type Comment, type VoteType } from "~/types/comments";
import { useAuth } from "~/hooks/use-auth";
import { CommentForm } from "./comment-form";

interface CommentItemProps {
  comment: Comment;
  onVote: (commentId: string, type: VoteType) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (data: {
    postId: string;
    content: string;
    parentId: string;
  }) => Promise<void>;
  depth?: number;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  onVote,
  onDelete,
  onReply,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.user.id;
  const isAdmin = user?.role === "ADMIN";
  const canDelete = isOwner || isAdmin;
  const canReply = depth < maxDepth && user;

  const handleVote = async (type: VoteType) => {
    if (!user) return;
    await onVote(comment.id, type);
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setIsDeleting(false);
    }
  };

  const handleReply = async (content: string) => {
    if (!canReply) return;

    try {
      await onReply({
        postId: comment.postId,
        content,
        parentId: comment.id,
      });
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to reply to comment:", error);
    }
  };

  return (
    <div
      className={cn("group", depth > 0 && "border-muted ml-6 border-l-2 pl-4")}
    >
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote("UPVOTE")}
            disabled={!user}
            className={cn(
              "h-8 w-8 p-0",
              comment.userVote === "UPVOTE" &&
                "text-green-600 dark:text-green-400 hover:bg-green-100",
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <span
            className={cn(
              "text-sm font-medium",
              comment.score > 0 && "text-green-600 dark:text-green-400",
              comment.score < 0 && "text-red-600 dark:text-red-400",
            )}
          >
            {comment.score}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote("DOWNVOTE")}
            disabled={!user}
            className={cn(
              "h-8 w-8 p-0",
              comment.userVote === "DOWNVOTE" &&
                "text-red-600 dark:text-red-400 hover:bg-red-100",
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {comment.user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{comment.user.name}</span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Actions menu */}
            {(canDelete || canReply) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canReply && (
                    <DropdownMenuItem
                      onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {comment.content}
            </ReactMarkdown>
          </div>

          {/* Action buttons */}
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            {!user && <span>Sign in to vote and reply</span>}
            {canReply && !showReplyForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(true)}
                className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}
            {comment.replyCount > 0 && (
              <span>
                {comment.replyCount}{" "}
                {comment.replyCount === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                submitText="Reply"
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
