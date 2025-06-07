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
import { cn } from "~/lib/utils";

const LoreBlockComponent = ({ node, updateAttributes, selected }: any) => {
  return (
    <NodeViewWrapper className="lore-block">
      <Card
        className={cn(
          "my-4 border-l-4 border-l-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20",
          selected && "ring-2 ring-blue-500",
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Lore
          </span>
        </div>
        <NodeViewContent
          className="prose prose-sm dark:prose-invert max-w-none"
          as="div"
        />
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
