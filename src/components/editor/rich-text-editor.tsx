"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  MessageSquare,
  Lightbulb,
  Upload,
} from "lucide-react";
import { LoreBlock } from "./lore-block";
import { TweetEmbed } from "./tweet-embed";
import { useUploadThing } from "~/lib/uploadthing";
import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";

interface RichTextEditorProps {
  content: any;
  onChange: (content: any) => void;
  onImageUpload?: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = "Start writing your post...",
  className,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const url = res[0].url;
        editor?.chain().focus().setImage({ src: url }).run();
        onImageUpload?.(url);
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
  });

  const handleImageUpload = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) {
        setIsUploading(true);
        startUpload([files[0]]);
      }
    },
    [startUpload],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      LoreBlock,
      TweetEmbed,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLoreBlock = () => {
    (editor.chain().focus() as any).setLoreBlock().run();
  };

  const addTweetEmbed = () => {
    const url = prompt("Enter Twitter/X URL:");
    if (url) {
      (editor.chain().focus() as any).setTweetEmbed({ url }).run();
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleImageUpload(target.files);
    };
    input.click();
  };

  return (
    <Card className={cn("w-full", className)}>
      {/* Toolbar */}
      <div className="border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Basic formatting */}
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <Button
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </Button>

          <Button
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </Button>

          <Button
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Custom blocks */}
          <Button
            variant="ghost"
            size="sm"
            onClick={addLoreBlock}
            title="Add Lore Block"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={addTweetEmbed}
            title="Add Tweet Embed"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading}
            title="Upload Image"
          >
            {isUploading ? (
              <Upload className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </Card>
  );
}
