import { useState, useEffect, useCallback } from "react";
import {
  type Comment,
  type CreateCommentData,
  type VoteType,
} from "~/types/comments";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for the post
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = (await response.json()) as Comment[];

      // Organize comments into nested structure
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      data.forEach((comment) => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into parent-child relationships
      data.forEach((comment) => {
        const commentWithReplies = commentsMap.get(comment.id)!;

        if (comment.parentId) {
          const parent = commentsMap.get(comment.parentId);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      setComments(rootComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Create a new comment
  const createComment = useCallback(
    async (data: CreateCommentData) => {
      try {
        setError(null);

        const response = await fetch("/api/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create comment");
        }

        const newComment = (await response.json()) as Comment;

        // Refetch to get updated structure
        await fetchComments();

        return newComment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      }
    },
    [fetchComments],
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null);

        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete comment");
        }

        // Refetch to get updated structure
        await fetchComments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      }
    },
    [fetchComments],
  );

  // Vote on a comment
  const toggleVote = useCallback(
    async (commentId: string, type: VoteType) => {
      try {
        setError(null);

        // Find current vote status
        const findComment = (commentList: Comment[]): Comment | null => {
          for (const comment of commentList) {
            if (comment.id === commentId) return comment;
            if (comment.replies) {
              const found = findComment(comment.replies);
              if (found) return found;
            }
          }
          return null;
        };

        const comment = findComment(comments);
        if (!comment) return;

        if (comment.userVote === type) {
          // Remove vote
          const response = await fetch(
            `/api/comments/votes?commentId=${commentId}`,
            {
              method: "DELETE",
            },
          );
          if (!response.ok) throw new Error("Failed to remove vote");
        } else {
          // Add/change vote
          const response = await fetch("/api/comments/votes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId, type }),
          });
          if (!response.ok) throw new Error("Failed to vote");
        }

        // Refetch to get updated vote counts
        await fetchComments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    },
    [comments, fetchComments],
  );

  // Fetch comments on mount
  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    deleteComment,
    toggleVote,
    refetch: fetchComments,
  };
}
