export type VoteType = "UPVOTE" | "DOWNVOTE";

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  createdAt: string;
  user: CommentUser;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: VoteType | null;
  replyCount: number;
  replies?: Comment[];
}

export interface CommentVote {
  id: string;
  type: VoteType;
  userId: string;
  commentId: string;
  createdAt: string;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: string;
}

export interface VoteCommentData {
  commentId: string;
  type: VoteType;
}
