"use client";

import { MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useCommentsWithQuery } from "~/hooks/use-comments-query";
import { useAuth } from "~/hooks/use-auth";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { type CreateCommentData } from "~/types/comments";

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { comments, loading, error, createComment, deleteComment, toggleVote } =
    useCommentsWithQuery(postId);

  const handleCreateComment = async (content: string) => {
    const data: CreateCommentData = {
      postId,
      content,
    };
    await createComment(data);
  };

  const handleReply = async (data: {
    postId: string;
    content: string;
    parentId: string;
  }) => {
    const commentData: CreateCommentData = {
      postId: data.postId,
      content: data.content,
      parentId: data.parentId,
    };
    await createComment(commentData);
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length ?? 0);
  }, 0);

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion ({totalComments})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* New comment form */}
        {user ? (
          <CommentForm
            postId={postId}
            onSubmit={handleCreateComment}
            placeholder="Share your thoughts on this incident..."
          />
        ) : (
          <Card className="p-4">
            <p className="text-muted-foreground text-center">
              Sign in to join the discussion
            </p>
          </Card>
        )}

        {/* Comments list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground ml-2">
              Loading comments...
            </span>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive">Failed to load comments</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts on this incident.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-4">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onVote={toggleVote}
                  onDelete={deleteComment}
                  onReply={handleReply}
                />
                {index < comments.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
