/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-regexp-exec */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Tweet } from "react-tweet";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X, ExternalLink } from "lucide-react";
import { useState } from "react";

const TweetEmbedComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.url);
  const [inputUrl, setInputUrl] = useState(node.attrs.url ?? "");

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleSave = () => {
    const tweetId = extractTweetId(inputUrl);
    if (tweetId) {
      updateAttributes({ url: inputUrl, tweetId });
      setIsEditing(false);
    }
  };

  const tweetId = node.attrs.tweetId ?? extractTweetId(node.attrs.url ?? "");

  return (
    <NodeViewWrapper className="tweet-embed">
      <Card className="my-4 p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Twitter/X URL:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNode()}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://twitter.com/username/status/123456789"
                className="flex-1"
              />
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tweet Embed</span>
                <a
                  href={node.attrs.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteNode()}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {tweetId ? (
              <div className="data-theme-light">
                <Tweet id={tweetId} />
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Invalid tweet URL
              </div>
            )}
          </div>
        )}
      </Card>
    </NodeViewWrapper>
  );
};

export const TweetEmbed = Node.create({
  name: "tweetEmbed",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      url: {
        default: "",
      },
      tweetId: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="tweet-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "tweet-embed" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TweetEmbedComponent);
  },

  addCommands() {
    return {
      setTweetEmbed:
        (attributes: any) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    } as any;
  },
});
