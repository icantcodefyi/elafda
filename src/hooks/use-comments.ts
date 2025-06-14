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

  // Helper function to update a comment in the nested structure
  const updateCommentInTree = useCallback((
    commentList: Comment[],
    commentId: string,
    updateFn: (comment: Comment) => Comment
  ): Comment[] => {
    return commentList.map(comment => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updateFn)
        };
      }
      return comment;
    });
  }, []);

  // Helper function to add a comment to the tree
  const addCommentToTree = useCallback((
    commentList: Comment[],
    newComment: Comment,
    parentId?: string
  ): Comment[] => {
    if (!parentId) {
      // Add as root comment
      return [...commentList, newComment];
    }

    // Add as reply to parent
    return commentList.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies ?? []), newComment],
          replyCount: comment.replyCount + 1
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addCommentToTree(comment.replies, newComment, parentId)
        };
      }
      return comment;
    });
  }, []);

  // Helper function to remove a comment from the tree
  const removeCommentFromTree = useCallback((
    commentList: Comment[],
    commentId: string
  ): Comment[] => {
    return commentList.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      return true;
    });
  }, []);

  // Create a new comment with optimistic update
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

        // Optimistically add the comment to the tree
        setComments(prevComments => 
          addCommentToTree(prevComments, newComment, data.parentId)
        );

        return newComment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // On error, refetch to get the correct state
        await fetchComments();
        throw err;
      }
    },
    [addCommentToTree, fetchComments],
  );

  // Delete a comment with optimistic update
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null);

        // Optimistically remove the comment
        const previousComments = comments;
        setComments(prevComments => removeCommentFromTree(prevComments, commentId));

        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // Revert optimistic update on error
          setComments(previousComments);
          throw new Error("Failed to delete comment");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      }
    },
    [comments, removeCommentFromTree],
  );

  // Vote on a comment with optimistic update
  const toggleVote = useCallback(
    async (commentId: string, type: VoteType) => {
      try {
        setError(null);

        // Find current comment to get current vote status
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

        const currentVote = comment.userVote;
        const isRemovingVote = currentVote === type;
        
        // Optimistically update the vote
        setComments(prevComments => 
          updateCommentInTree(prevComments, commentId, (comment) => {
            let newScore = comment.score;
            let newUpvotes = comment.upvotes;
            let newDownvotes = comment.downvotes;
            let newUserVote: VoteType | null = null;

            // Remove previous vote effect
            if (currentVote === "UPVOTE") {
              newScore--;
              newUpvotes--;
            } else if (currentVote === "DOWNVOTE") {
              newScore++;
              newDownvotes--;
            }

            // Apply new vote effect (if not removing)
            if (!isRemovingVote) {
              newUserVote = type;
              if (type === "UPVOTE") {
                newScore++;
                newUpvotes++;
              } else if (type === "DOWNVOTE") {
                newScore--;
                newDownvotes++;
              }
            }

            return {
              ...comment,
              score: newScore,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: newUserVote
            };
          })
        );

        // Make the API call
        if (isRemovingVote) {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // On error, refetch to get the correct state
        await fetchComments();
      }
    },
    [comments, updateCommentInTree, fetchComments],
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
