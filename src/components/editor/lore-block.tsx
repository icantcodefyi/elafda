/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { BookOpen, X, Sparkles } from "lucide-react";
import { useState } from "react";

const LoreBlockComponent = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NodeViewWrapper className="lore-block">
      <Card
        className={cn(
          "group relative my-6 overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50",
          "dark:from-violet-950/30 dark:via-purple-950/30 dark:to-indigo-950/30",
          "border-l-4 border-l-violet-500 hover:border-l-violet-600",
          "shadow-sm hover:shadow-md",
          selected && "ring-2 ring-violet-500 ring-offset-2",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2">
            <Sparkles className="h-16 w-16 rotate-12 text-violet-500" />
          </div>
          <div className="absolute bottom-2 left-2">
            <BookOpen className="h-12 w-12 -rotate-12 text-purple-500" />
          </div>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteNode()}
          className={cn(
            "absolute top-2 right-2 z-10 h-7 w-7 rounded-full p-0",
            "bg-white/80 hover:bg-red-50 dark:bg-gray-900/80 dark:hover:bg-red-950/50",
            "border border-gray-200 dark:border-gray-700",
            "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            "text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer",
          )}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="relative p-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
              <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                  Lore
                </span>
                <div className="h-1 w-1 rounded-full bg-violet-400 dark:bg-violet-500" />
                <span className="text-xs font-medium text-violet-600/70 dark:text-violet-400/70">
                  Background Information
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <NodeViewContent
              className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "prose-headings:text-gray-800 dark:prose-headings:text-gray-200",
                "prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed",
                "prose-strong:text-violet-700 dark:prose-strong:text-violet-300",
                "prose-em:text-purple-600 dark:prose-em:text-purple-400",
                "focus-within:outline-none",
                "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
              )}
              as="div"
            />

            {/* Subtle gradient overlay for depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-violet-50/20 dark:to-violet-950/20" />
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400" />
      </Card>
    </NodeViewWrapper>
  );
};

export const LoreBlock = Node.create({
  name: "loreBlock",

  group: "block",

  content: "block+",

  isolating: true,

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="lore-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "lore-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LoreBlockComponent);
  },

  addCommands() {
    return {
      setLoreBlock:
        () =>
        ({ commands }: any) => {
          return commands.wrapIn(this.name);
        },
    } as any;
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => (this.editor.commands as any).setLoreBlock(),
    };
  },
});
