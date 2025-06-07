"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { LoreBlock } from "~/components/editor/lore-block";
import { TweetEmbed } from "~/components/editor/tweet-embed";
import type { TiptapContent } from "~/types/editor";

interface PostRendererProps {
  content: TiptapContent;
  className?: string;
}

export function PostRenderer({ content, className }: PostRendererProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image, LoreBlock, TweetEmbed],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none ${className ?? ""}`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
