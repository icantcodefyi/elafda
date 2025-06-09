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
}: {
  commentId: string;
  type: VoteType;
}): Promise<void> {
  const response = await fetch("/api/comments/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId, type }),
  });

  if (!response.ok) {
    throw new Error("Failed to vote on comment");
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
    onSuccess: () => {
      // Invalidate and refetch comments
      void queryClient.invalidateQueries({
        queryKey: commentKeys.post(postId),
      });
    },
  });
}

export function useVoteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteComment,
    onSuccess: () => {
      // Invalidate and refetch comments to get updated vote counts
      void queryClient.invalidateQueries({
        queryKey: commentKeys.post(postId),
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      // Invalidate and refetch comments
      void queryClient.invalidateQueries({
        queryKey: commentKeys.post(postId),
      });
    },
  });
}
