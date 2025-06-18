"use client";

import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useCommentsWithQuery } from "~/hooks/use-comments-query";
import { useAuth } from "~/hooks/use-auth";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { type CreateCommentData } from "~/types/comments";

interface CommentsSectionProps {
  postId: string;
}

function CommentSkeleton({ depth = 0 }: { depth?: number }) {
  return (
    <div className={`relative ${depth > 0 ? 'ml-8' : ''}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <Skeleton className="h-full w-full rounded-full" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          
          <div className="space-y-1">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-4 w-6 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6 mb-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <CommentSkeleton />
        </div>
      ))}
    </div>
  );
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
          Discussion ({totalComments})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {loading ? (
          <CommentsSkeleton count={1} />
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
