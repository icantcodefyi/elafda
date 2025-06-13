/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-regexp-exec */
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
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
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
  Twitter,
  AlertCircle,
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
  const [isTweetDialogOpen, setIsTweetDialogOpen] = useState(false);
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetError, setTweetError] = useState<string | null>(null);

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
      handlePaste: (view, event, slice) => {
        // Get the pasted content
        const text = event.clipboardData?.getData('text/plain') ?? '';
        
        // Check if it's a Twitter/X URL
        const twitterMatch = text.match(/(?:https?:\/\/)?(?:twitter\.com|x\.com)\/.*\/status\/(\d+)/);
        
        if (twitterMatch && twitterMatch[1]) {
          // Prevent default paste behavior
          event.preventDefault();
          
          // Insert tweet embed instead
          const tweetId = twitterMatch[1];
          const url = text.startsWith('http') ? text : `https://${text}`;
          
          // Add a small delay to show the conversion happening
          setTimeout(() => {
            (editor?.chain().focus() as any)?.setTweetEmbed({
              url: url.trim(),
              tweetId,
            }).run();
          }, 100);
          
          return true; // Handled
        }
        
        return false; // Let default paste behavior handle it
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key after typing a Twitter/X URL
        if (event.key === 'Enter') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Get the current paragraph text
          const paragraph = $from.parent;
          if (paragraph.type.name === 'paragraph') {
            const text = paragraph.textContent;
            const twitterMatch = text.match(/(?:https?:\/\/)?(?:twitter\.com|x\.com)\/.*\/status\/(\d+)/);
            
            if (twitterMatch && twitterMatch[1]) {
              // Prevent default Enter behavior
              event.preventDefault();
              
              // Replace the paragraph with a tweet embed
              const tweetId = twitterMatch[1];
              const url = text.startsWith('http') ? text : `https://${text}`;
              
              // Delete the current paragraph and insert tweet embed
              const tr = state.tr;
              tr.delete($from.start() - 1, $from.end());
              
              setTimeout(() => {
                (editor?.chain().focus() as any)?.setTweetEmbed({
                  url: url.trim(),
                  tweetId,
                }).run();
                
                // Add a new paragraph after the embed
                (editor?.chain() as any)?.insertContent('<p></p>').run();
              }, 100);
              
              return true; // Handled
            }
          }
        }
        
        return false; // Let default behavior handle it
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLoreBlock = () => {
    (editor.chain().focus() as any).setLoreBlock().run();
  };

  const extractTweetId = (url: string): string | null => {
    if (!url) return null;

    try {
      // Handle both twitter.com and x.com URLs
      const twitterMatch = url.match(
        /(?:twitter\.com|x\.com)\/.*\/status\/(\d+)/,
      );
      return twitterMatch?.[1] ?? null;
    } catch (e) {
      return null;
    }
  };

  const handleTweetSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tweetUrl.trim()) {
      setTweetError("Please enter a URL");
      return;
    }

    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      setTweetError("Invalid Twitter/X URL. Please enter a valid tweet URL.");
      return;
    }

    // Add the tweet embed to the editor
    (editor.chain().focus() as any)
      .setTweetEmbed({
        url: tweetUrl.trim(),
        tweetId,
      })
      .run();

    // Reset state and close dialog
    setTweetUrl("");
    setTweetError(null);
    setIsTweetDialogOpen(false);
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
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        {/* Toolbar */}
        <div className="border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Basic formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive("bold") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bold text (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive("italic") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Italic text (Ctrl+I)</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Headings */}
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 1 - Large title for main sections</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 2 - Medium title for subsections</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Heading 3 - Small title for minor sections</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive("bulletList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bullet list - Create unordered list with bullet points</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive("orderedList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numbered list - Create ordered list with numbers</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive("blockquote") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quote - Highlight important text or citations</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Custom blocks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addLoreBlock}
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lore Block - Add background information or context (Ctrl+Shift+L)</p>
              </TooltipContent>
            </Tooltip>

            <Dialog open={isTweetDialogOpen} onOpenChange={setIsTweetDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTweetUrl("");
                        setTweetError(null);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tweet Embed - Include tweets from Twitter/X in your post</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    Embed Tweet
                  </DialogTitle>
                  <DialogDescription>
                    Enter a Twitter/X tweet URL to embed it in your content.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTweetSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Input
                      id="tweetUrl"
                      value={tweetUrl}
                      onChange={(e) => {
                        setTweetUrl(e.target.value);
                        setTweetError(null);
                      }}
                      placeholder="https://twitter.com/username/status/123456789"
                      className={cn(
                        "w-full",
                        tweetError && "border-red-500 focus:border-red-500",
                      )}
                    />
                    {tweetError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {tweetError}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsTweetDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Embed Tweet</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isUploading ? "Uploading image..." : "Upload Image - Add images to your post"}</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo - Reverse last action (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo - Restore undone action (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor */}
        <div className="min-h-[400px] px-6">
          <EditorContent editor={editor} />
        </div>
      </Card>
    </TooltipProvider>
  );
}
