import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Comment,
  type CreateCommentData,
  type VoteType,
} from "~/types/comments";

// Query key factory
const commentKeys = {
  all: ["comments"] as const,
  post: (postId: string) => [...commentKeys.all, "post", postId] as const,
};

// Helper functions for optimistic updates
function updateCommentInTree(
  commentList: Comment[],
  commentId: string,
  updateFn: (comment: Comment) => Comment
): Comment[] {
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
}

function addCommentToTree(
  commentList: Comment[],
  newComment: Comment,
  parentId?: string
): Comment[] {
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
}

function removeCommentFromTree(
  commentList: Comment[],
  commentId: string
): Comment[] {
  return commentList.filter(comment => {
    if (comment.id === commentId) {
      return false;
    }
    if (comment.replies && comment.replies.length > 0) {
      comment.replies = removeCommentFromTree(comment.replies, commentId);
    }
    return true;
  });
}

// API functions
async function fetchComments(postId: string): Promise<Comment[]> {
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

  return rootComments;
}

async function createComment(data: CreateCommentData): Promise<Comment> {
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

  return response.json() as Promise<Comment>;
}

async function voteComment({
  commentId,
  type,
  currentVote,
}: {
  commentId: string;
  type: VoteType;
  currentVote?: VoteType | null;
}): Promise<void> {
  const isRemovingVote = currentVote === type;
  
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
}

async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
}

// Hooks
export function useCommentsQuery(postId: string) {
  return useQuery({
    queryKey: commentKeys.post(postId),
    queryFn: () => fetchComments(postId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onMutate: async (newCommentData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.post(postId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(commentKeys.post(postId));

      // Optimistically update to the new value
      if (previousComments) {
        // Create a temporary comment for optimistic update
        const tempComment: Comment = {
          id: `temp-${Date.now()}`, // Temporary ID
          content: newCommentData.content,
          postId: newCommentData.postId,
          parentId: newCommentData.parentId ?? null,
          createdAt: new Date().toISOString(),
          user: { id: "temp", name: "You", image: null }, // Will be replaced with real data
          upvotes: 0,
          downvotes: 0,
          score: 0,
          userVote: null,
          replyCount: 0,
          replies: []
        };

        const optimisticComments = addCommentToTree(
          previousComments,
          tempComment,
          newCommentData.parentId
        );

        queryClient.setQueryData(commentKeys.post(postId), optimisticComments);
      }

      // Return a context object with the snapshotted value
      return { previousComments };
    },
    onSuccess: (newComment) => {
      // Replace the temporary comment with the real one
      const currentComments = queryClient.getQueryData<Comment[]>(commentKeys.post(postId));
      if (currentComments) {
        // Remove temp comment and add real comment
        const withoutTemp = currentComments.filter(c => !c.id.startsWith('temp-'));
                 const withRealComment = addCommentToTree(withoutTemp, newComment, newComment.parentId ?? undefined);
        queryClient.setQueryData(commentKeys.post(postId), withRealComment);
      }
    },
    onError: (err, newCommentData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(commentKeys.post(postId), context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      void queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
  });
}

export function useVoteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteComment,
    onMutate: async ({ commentId, type, currentVote }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.post(postId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(commentKeys.post(postId));

      // Optimistically update to the new value
      if (previousComments) {
        const isRemovingVote = currentVote === type;
        
        const optimisticComments = updateCommentInTree(
          previousComments,
          commentId,
          (comment) => {
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
          }
        );

        queryClient.setQueryData(commentKeys.post(postId), optimisticComments);
      }

      // Return a context object with the snapshotted value
      return { previousComments };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(commentKeys.post(postId), context.previousComments);
      }
    },
    onSettled: () => {
      // Refetch after a delay to ensure we have the latest vote counts
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
      }, 1000);
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onMutate: async (commentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.post(postId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(commentKeys.post(postId));

      // Optimistically update to the new value
      if (previousComments) {
        const optimisticComments = removeCommentFromTree(previousComments, commentId);
        queryClient.setQueryData(commentKeys.post(postId), optimisticComments);
      }

      // Return a context object with the snapshotted value
      return { previousComments };
    },
    onError: (err, commentId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(commentKeys.post(postId), context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
  });
}

// Combined hook that provides the same interface as useComments
export function useCommentsWithQuery(postId: string) {
  const {
    data: comments = [],
    isLoading: loading,
    error: queryError,
  } = useCommentsQuery(postId);

  const createCommentMutation = useCreateComment(postId);
  const voteCommentMutation = useVoteComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const error = queryError?.message ?? createCommentMutation.error?.message ?? 
                voteCommentMutation.error?.message ?? deleteCommentMutation.error?.message ?? null;

  const createComment = async (data: CreateCommentData) => {
    return createCommentMutation.mutateAsync(data);
  };

  const toggleVote = async (commentId: string, type: VoteType) => {
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
    const currentVote = comment?.userVote ?? null;

    return voteCommentMutation.mutateAsync({
      commentId,
      type,
      currentVote,
    });
  };

  const deleteComment = async (commentId: string) => {
    return deleteCommentMutation.mutateAsync(commentId);
  };

  return {
    comments,
    loading,
    error,
    createComment,
    deleteComment,
    toggleVote,
    refetch: () => {
      // This is handled by React Query automatically
    },
  };
}
