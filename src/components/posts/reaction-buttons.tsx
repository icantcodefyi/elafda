"use client";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useReactions } from "~/hooks/use-reactions";
import {
  REACTION_ICONS,
  REACTION_LABELS,
  type ReactionType,
} from "~/types/reactions";
import { useAuth } from "~/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

export function ReactionButtons({ postId, className }: ReactionButtonsProps) {
  const { user } = useAuth();
  const { reactions, loading, toggleReaction } = useReactions(postId);

  const handleReactionClick = async (type: ReactionType) => {
    if (!user) {
      // Could show a login prompt here
      return;
    }

    await toggleReaction(type);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">
          Loading reactions...
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {REACTION_TYPES.map((type) => {
        const count = reactions.counts[type] ?? 0;
        const isActive = reactions.userReaction === type;
        const icon = REACTION_ICONS[type];
        const label = REACTION_LABELS[type];

        return (
          <Button
            key={type}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleReactionClick(type)}
            disabled={!user}
            className={cn(
              "h-8 px-3 text-xs transition-all duration-200",
              isActive && "bg-primary text-primary-foreground",
              count > 0 && !isActive && "bg-muted/50",
              !user && "cursor-not-allowed opacity-50",
            )}
            title={user ? `${label} this post` : "Sign in to react"}
          >
            <FontAwesomeIcon icon={icon} className="mr-1 h-3 w-3" />
            {count > 0 && (
              <span className="ml-1 text-xs font-medium">{count}</span>
            )}
          </Button>
        );
      })}

      {!user && (
        <span className="text-muted-foreground ml-2 text-xs">
          Sign in to react
        </span>
      )}
    </div>
  );
}
