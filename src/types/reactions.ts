import {
  faThumbsUp,
  faThumbsDown,
  faFire,
  faHeart,
  faFaceSadTear,
} from "@fortawesome/free-solid-svg-icons";

export type ReactionType = "LIKE" | "DISLIKE" | "FIRE" | "HEART" | "CRY";

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReactionCounts = Record<ReactionType, number>;

export interface ReactionData {
  counts: ReactionCounts;
  userReaction: ReactionType | null;
}

export const REACTION_ICONS: Record<ReactionType, typeof faThumbsUp> = {
  LIKE: faThumbsUp,
  DISLIKE: faThumbsDown,
  FIRE: faFire,
  HEART: faHeart,
  CRY: faFaceSadTear,
};

// Keep the old REACTION_EMOJIS for backward compatibility if needed
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: "👍",
  DISLIKE: "👎",
  FIRE: "🔥",
  HEART: "❤️",
  CRY: "😭",
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: "Like",
  DISLIKE: "Dislike",
  FIRE: "Fire",
  HEART: "Love",
  CRY: "Sad",
};
