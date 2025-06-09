"use client";

import { cn } from "~/lib/utils";
import { useReactionsQuery } from "~/hooks/use-reactions-query";
import {
  REACTION_ICONS,
  REACTION_LABELS,
  type ReactionType,
} from "~/types/reactions";
import { useAuth } from "~/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ReactionButtonsProps {
  postId: string;
  className?: string;
}

const REACTION_TYPES: ReactionType[] = [
  "LIKE",
  "FIRE",
  "HEART",
  "CRY",
  "DISLIKE",
];

// Twitter-like colors for each reaction
const REACTION_COLORS = {
  LIKE: {
    active: "text-blue-500 dark:text-blue-400",
    hover:
      "hover:text-blue-500 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/50",
  },
  FIRE: {
    active: "text-orange-500 dark:text-orange-400",
    hover:
      "hover:text-orange-500 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-950/50",
  },
  HEART: {
    active: "text-red-500 dark:text-red-400",
    hover:
      "hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/50",
  },
  CRY: {
    active: "text-yellow-500 dark:text-yellow-400",
    hover:
      "hover:text-yellow-500 hover:bg-yellow-50 dark:hover:text-yellow-400 dark:hover:bg-yellow-950/50",
  },
  DISLIKE: {
    active: "text-gray-600 dark:text-gray-400",
    hover:
      "hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-400 dark:hover:bg-gray-800/50",
  },
} as const;

export function ReactionButtons({ postId, className }: ReactionButtonsProps) {
  const { user } = useAuth();
  const { reactions, loading, toggleReaction, isToggling } =
    useReactionsQuery(postId);

  const handleReactionClick = async (type: ReactionType) => {
    if (!user) {
      // Could show a login prompt here
      return;
    }

    toggleReaction(type);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">
          Loading reactions...
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {REACTION_TYPES.map((type) => {
        const count = reactions.counts[type] ?? 0;
        const isActive = reactions.userReaction === type;
        const icon = REACTION_ICONS[type];
        const label = REACTION_LABELS[type];
        const colors = REACTION_COLORS[type];

        return (
          <button
            key={type}
            onClick={() => handleReactionClick(type)}
            disabled={!user || isToggling}
            className={cn(
              "group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200",
              "cursor-pointer border border-transparent",
              (!user || isToggling) && "cursor-not-allowed opacity-50",
              isActive
                ? colors.active
                : `text-muted-foreground ${colors.hover}`,
              "disabled:hover:text-muted-foreground disabled:hover:bg-transparent",
            )}
            title={user ? `${label} this post` : "Sign in to react"}
          >
            <FontAwesomeIcon
              icon={icon}
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                "group-hover:scale-110",
                isActive && "scale-110",
                isToggling && "animate-pulse",
              )}
            />
            {count > 0 && (
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isActive ? colors.active : "text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {!user && (
        <span className="text-muted-foreground ml-3 text-xs">
          Sign in to react
        </span>
      )}
    </div>
  );
}
