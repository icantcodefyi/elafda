"use client";

import { PostRenderer } from "~/components/posts/post-renderer";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { CommentsSection } from "~/components/comments/comments-section";
import { Separator } from "~/components/ui/separator";
import type { TiptapContent } from "~/types/editor";

interface PostClientWrapperProps {
  postId: string;
  content: TiptapContent;
}

export function PostClientWrapper({ postId, content }: PostClientWrapperProps) {
  return (
    <>
      {/* Post Content */}
      <PostRenderer content={content} />

      <Separator className="bg-border/50" />

      <ReactionButtons postId={postId} />

      <CommentsSection postId={postId} />
    </>
  );
}
