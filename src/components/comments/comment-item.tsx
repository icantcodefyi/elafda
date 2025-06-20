"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Trash2,
  MoreVertical,
  Minus,
  Plus,
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
import { MentionRenderer } from "./mention-renderer";

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
  isLastInThread?: boolean;
  parentCollapsed?: boolean;
}

export function CommentItem({
  comment,
  onVote,
  onDelete,
  onReply,
  depth = 0,
  isLastInThread = false,
  parentCollapsed = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isOwner = user?.id === comment.user.id;
  const isAdmin = user?.role === "ADMIN";
  const canDelete = isOwner || isAdmin;
  const canReply = user;
  const hasReplies = comment.replies && comment.replies.length > 0;

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (showReplyForm) {
      setShowReplyForm(false);
    }
  };

  const getTotalRepliesCount = (comment: Comment): number => {
    if (!comment.replies) return 0;
    return comment.replies.reduce((total, reply) => {
      return total + 1 + getTotalRepliesCount(reply);
    }, 0);
  };

  const totalReplies = getTotalRepliesCount(comment);

  return (
    <div
      className={cn(
        "relative",
        depth > 0 && "ml-8",
        parentCollapsed && "hidden"
      )}
    >
      <div className="group">
        <div className="flex gap-3">
          <div className="flex-shrink-0 flex items-start pt-1">
            {hasReplies ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isCollapsed ? (
                    <Plus className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </motion.div>
              </Button>
            ) : (
              null
            )}
          </div>

          <div className="flex-shrink-0 mt-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.image ?? undefined} />
              <AvatarFallback className="text-sm">
                {comment.user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{comment.user.name}</span>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(comment.createdAt))}
                </span>
                <AnimatePresence>
                  {hasReplies && isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-muted-foreground text-xs whitespace-nowrap"
                    >
                      ({totalReplies} {totalReplies === 1 ? 'reply' : 'replies'})
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {(canDelete || canReply) && !comment.isDeleted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

            {comment.isDeleted ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                <span className="text-muted-foreground italic">[deleted]</span>
              </div>
            ) : (
              <MentionRenderer content={comment.content} />
            )}

            {!comment.isDeleted && (
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                {user && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote("UPVOTE")}
                      className={cn(
                        "h-6 w-6 p-0",
                        comment.userVote === "UPVOTE" &&
                          "text-green-600 hover:bg-green-100 dark:text-green-400",
                      )}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>

                    <span
                      className={cn(
                        "text-xs font-medium min-w-[20px] text-center",
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
                      className={cn(
                        "h-6 w-6 p-0",
                        comment.userVote === "DOWNVOTE" &&
                          "text-red-600 hover:bg-red-100 dark:text-red-400",
                      )}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {!user && <span>Sign in to vote and reply</span>}
                
                {canReply && !showReplyForm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(true)}
                    className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                  >
                    Reply
                  </Button>
                )}
              </div>
            )}

            <AnimatePresence>
              {showReplyForm && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-visible"
                >
                  <CommentForm
                    postId={comment.postId}
                    parentId={comment.id}
                    onSubmit={handleReply}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder="Write a reply..."
                    submitText="Reply"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasReplies && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut",
              opacity: { duration: 0.2 }
            }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {comment.replies!.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                <CommentItem
                  comment={reply}
                  onVote={onVote}
                  onDelete={onDelete}
                  onReply={onReply}
                  depth={depth + 1}
                  isLastInThread={index === comment.replies!.length - 1}
                  parentCollapsed={isCollapsed}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
