"use client";

import { cn } from "~/lib/utils";
import { useReactionsQuery } from "~/hooks/use-reactions-query";
import {
  REACTION_ICONS,
  REACTION_LABELS,
  type ReactionType,
} from "~/types/reactions";
import { useAuth } from "~/hooks/use-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SignInDialog } from "~/components/auth/sign-in-dialog";

interface ReactionButtonsProps {
  postId: string;
  className?: string;
}

// Only keep HEART reaction
const REACTION_TYPES: ReactionType[] = ["HEART"];

// Twitter-like colors for heart reaction
const REACTION_COLORS: Record<"HEART", { active: string; hover: string }> = {
  HEART: {
    active: "text-red-500 dark:text-red-400",
    hover:
      "hover:text-red-500 dark:hover:text-red-400",
  },
} as const;

export function ReactionButtons({ postId, className }: ReactionButtonsProps) {
  const { user, showSignInDialog, setShowSignInDialog } = useAuth();
  const { reactions, toggleReaction, isToggling } = useReactionsQuery(postId);

  const handleReactionClick = async (type: ReactionType) => {
    if (!user) {
      setShowSignInDialog(true);
      return;
    }

    toggleReaction(type);
  };

  const handleSignInClick = () => {
    setShowSignInDialog(true);
  };

  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        {REACTION_TYPES.map((type) => {
          const count = reactions.counts[type] ?? 0;
          const isActive = reactions.userReaction === type;
          const icon = REACTION_ICONS[type];
          const label = REACTION_LABELS[type];
          const colors = REACTION_COLORS[type as keyof typeof REACTION_COLORS];

          return (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              disabled={isToggling}
              className={cn(
                "group flex items-center gap-1.5 rounded-full px-1 py-1.5 text-sm transition-all duration-200",
                "cursor-pointer border border-transparent",
                isToggling && "cursor-not-allowed opacity-50",
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
                  isActive && "",
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
          <button
            onClick={handleSignInClick}
            className="text-muted-foreground hover:text-foreground ml-3 text-xs transition-colors cursor-pointer"
          >
            Sign in to react
          </button>
        )}
      </div>

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
    </>
  );
}
