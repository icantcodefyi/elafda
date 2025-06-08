"use client";

import { PostRenderer } from "~/components/posts/post-renderer";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { CommentsSection } from "~/components/comments/comments-section";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import type { TiptapContent } from "~/types/editor";

interface PostClientWrapperProps {
  postId: string;
  content: TiptapContent;
}

export function PostClientWrapper({ postId, content }: PostClientWrapperProps) {
  return (
    <>
      {/* Post Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <PostRenderer content={content} />
      </div>

      <Separator className="bg-border/50" />

      {/* Interaction Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground flex items-center gap-2 font-semibold">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-muted-foreground h-4 w-4"
            />
            Reactions
          </h3>
        </div>
        <ReactionButtons postId={postId} />
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <CommentsSection postId={postId} />
      </div>
    </>
  );
}
