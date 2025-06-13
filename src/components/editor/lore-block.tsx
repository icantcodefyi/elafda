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
import { X, Info } from "lucide-react";
import { useState } from "react";

const LoreBlockComponent = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
  editor,
}: any) => {
  const [isHovered, setIsHovered] = useState(false);

  // Check if editor is editable
  const isEditable = editor?.isEditable ?? true;

  return (
    <NodeViewWrapper className="lore-block">
      <Card
        className={cn(
          "group relative mb-4 py-0 transition-all duration-200",
          "bg-muted/50 hover:bg-muted/70",
          "border-border hover:border-muted-foreground/20 border",
          "shadow-sm hover:shadow-md",
          selected && "ring-ring ring-2 ring-offset-2",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Remove button - only show in editable mode */}
        {isEditable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteNode()}
            className={cn(
              "absolute top-2 right-2 z-10 h-6 w-6 rounded-md p-0",
              "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              "hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <div className="relative p-4">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-background flex h-6 w-6 items-center justify-center rounded-md border">
              <Info className="text-muted-foreground h-3.5 w-3.5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Background Information
            </span>
          </div>

          {/* Content */}
          <div className="relative">
            <NodeViewContent
              className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "prose-headings:text-foreground prose-headings:font-medium",
                "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-sm",
                "prose-strong:text-foreground prose-strong:font-medium",
                "prose-em:text-foreground",
                "focus-within:outline-none",
                "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
                "[&_li]:my-0.5 [&_ol]:my-2 [&_ul]:my-2",
              )}
              as="div"
            />
          </div>
        </div>
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
