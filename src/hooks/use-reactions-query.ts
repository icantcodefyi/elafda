import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactionType, type ReactionData } from "~/types/reactions";

const reactionKeys = {
  all: ["reactions"] as const,
  post: (postId: string) => [...reactionKeys.all, "post", postId] as const,
};

async function fetchReactions(postId: string): Promise<ReactionData> {
  const response = await fetch(`/api/reactions?postId=${postId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch reactions");
  }
  return response.json() as Promise<ReactionData>;
}

async function toggleReaction({
  postId,
  type,
}: {
  postId: string;
  type: ReactionType;
}) {
  const response = await fetch("/api/reactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, type }),
  });

  if (!response.ok) {
    throw new Error("Failed to toggle reaction");
  }

  return response.json() as Promise<ReactionData>;
}

async function removeReaction(postId: string) {
  const response = await fetch(`/api/reactions?postId=${postId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove reaction");
  }

  return response.json() as Promise<ReactionData>;
}

export function useReactionsQuery(postId: string) {
  const queryClient = useQueryClient();

  const {
    data: reactions = {
      counts: { LIKE: 0, DISLIKE: 0, FIRE: 0, HEART: 0, CRY: 0 },
      userReaction: null,
    },
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: reactionKeys.post(postId),
    queryFn: () => fetchReactions(postId),
    staleTime: 30 * 1000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ type }: { type: ReactionType }) =>
      toggleReaction({ postId, type }),
    onMutate: async ({ type }) => {
      await queryClient.cancelQueries({ queryKey: reactionKeys.post(postId) });

      const previousReactions = queryClient.getQueryData<ReactionData>(
        reactionKeys.post(postId),
      );

      if (previousReactions) {
        const newCounts = { ...previousReactions.counts };

        if (previousReactions.userReaction) {
          newCounts[previousReactions.userReaction] = Math.max(
            0,
            (newCounts[previousReactions.userReaction] ?? 0) - 1,
          );
        }

        if (previousReactions.userReaction === type) {
          queryClient.setQueryData<ReactionData>(reactionKeys.post(postId), {
            counts: newCounts,
            userReaction: null,
          });
        } else {
          newCounts[type] = (newCounts[type] ?? 0) + 1;
          queryClient.setQueryData<ReactionData>(reactionKeys.post(postId), {
            counts: newCounts,
            userReaction: type,
          });
        }
      }

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      if (context?.previousReactions) {
        queryClient.setQueryData(
          reactionKeys.post(postId),
          context.previousReactions,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: reactionKeys.post(postId),
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeReaction(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: reactionKeys.post(postId) });

      const previousReactions = queryClient.getQueryData<ReactionData>(
        reactionKeys.post(postId),
      );

      if (previousReactions?.userReaction) {
        const newCounts = { ...previousReactions.counts };
        newCounts[previousReactions.userReaction] = Math.max(
          0,
          (newCounts[previousReactions.userReaction] ?? 0) - 1,
        );

        queryClient.setQueryData<ReactionData>(reactionKeys.post(postId), {
          counts: newCounts,
          userReaction: null,
        });
      }

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      if (context?.previousReactions) {
        queryClient.setQueryData(
          reactionKeys.post(postId),
          context.previousReactions,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: reactionKeys.post(postId),
      });
    },
  });

  const handleToggleReaction = (type: ReactionType) => {
    if (reactions.userReaction === type) {
      removeMutation.mutate();
    } else {
      toggleMutation.mutate({ type });
    }
  };

  return {
    reactions,
    loading,
    error: error?.message ?? null,
    toggleReaction: handleToggleReaction,
    isToggling: toggleMutation.isPending || removeMutation.isPending,
  };
}
