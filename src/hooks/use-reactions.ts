import { useState, useEffect, useCallback } from "react";
import { type ReactionType, type ReactionData } from "~/types/reactions";

export function useReactions(postId: string) {
  const [reactions, setReactions] = useState<ReactionData>({
    counts: {},
    userReaction: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reactions for the post
  const fetchReactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reactions?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reactions");
      }

      const data = (await response.json()) as ReactionData;
      setReactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Add or update a reaction
  const addReaction = useCallback(
    async (type: ReactionType) => {
      try {
        setError(null);

        const response = await fetch("/api/reactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, type }),
        });

        if (!response.ok) {
          throw new Error("Failed to add reaction");
        }

        // Optimistically update the UI
        setReactions((prev) => {
          const newCounts = { ...prev.counts };

          // Remove previous reaction count if user had one
          if (prev.userReaction) {
            newCounts[prev.userReaction] = Math.max(
              0,
              (newCounts[prev.userReaction] ?? 0) - 1,
            );
          }

          // Add new reaction count
          newCounts[type] = (newCounts[type] ?? 0) + 1;

          return {
            counts: newCounts,
            userReaction: type,
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Revert optimistic update by refetching
        await fetchReactions();
      }
    },
    [postId, fetchReactions],
  );

  // Remove a reaction
  const removeReaction = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/reactions?postId=${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove reaction");
      }

      // Optimistically update the UI
      setReactions((prev) => {
        if (!prev.userReaction) return prev;

        const newCounts = { ...prev.counts };
        newCounts[prev.userReaction] = Math.max(
          0,
          (newCounts[prev.userReaction] ?? 0) - 1,
        );

        return {
          counts: newCounts,
          userReaction: null,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Revert optimistic update by refetching
      await fetchReactions();
    }
  }, [postId, fetchReactions]);

  // Toggle reaction (add if not present, remove if same, change if different)
  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (reactions.userReaction === type) {
        await removeReaction();
      } else {
        await addReaction(type);
      }
    },
    [reactions.userReaction, addReaction, removeReaction],
  );

  // Fetch reactions on mount
  useEffect(() => {
    void fetchReactions();
  }, [fetchReactions]);

  return {
    reactions,
    loading,
    error,
    toggleReaction,
    refetch: fetchReactions,
  };
}
