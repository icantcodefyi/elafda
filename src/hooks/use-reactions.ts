import { useState, useEffect, useCallback } from "react";
import { type ReactionType, type ReactionData } from "~/types/reactions";

export function useReactions(postId: string) {
  const [reactions, setReactions] = useState<ReactionData>({
    counts: {
      LIKE: 0,
      DISLIKE: 0,
      FIRE: 0,
      HEART: 0,
      CRY: 0,
    },
    userReaction: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setReactions((prev) => {
          const newCounts = { ...prev.counts };

          if (prev.userReaction) {
            newCounts[prev.userReaction] = Math.max(
              0,
              (newCounts[prev.userReaction] ?? 0) - 1,
            );
          }

          newCounts[type] = (newCounts[type] ?? 0) + 1;

          return {
            counts: newCounts,
            userReaction: type,
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        await fetchReactions();
      }
    },
    [postId, fetchReactions],
  );

  const removeReaction = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/reactions?postId=${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove reaction");
      }

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
      await fetchReactions();
    }
  }, [postId, fetchReactions]);

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
