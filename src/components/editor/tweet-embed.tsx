/* eslint-disable @typescript-eslint/no-unused-vars */
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
  X,
  ExternalLink,
  Twitter,
  Edit,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

const TweetEmbedComponent = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(
    !node.attrs.url || !node.attrs.tweetId,
  );
  const [inputUrl, setInputUrl] = useState(node.attrs.url ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const validateAndSaveTweet = (url: string) => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      setError("Invalid Twitter/X URL. Please enter a valid tweet URL.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Update the node attributes
    updateAttributes({ url: url.trim(), tweetId });
    setIsDialogOpen(false);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSaveTweet(inputUrl);
  };

  useEffect(() => {
    // Auto-open dialog if no URL is set
    if (!node.attrs.url) {
      setIsDialogOpen(true);
    }
  }, [node.attrs.url]);

  const tweetId =
    (node.attrs.tweetId as string | undefined) ??
    extractTweetId(node.attrs.url ?? "") ??
    null;
  const hasValidTweet = tweetId && node.attrs.url;

  return (
    <NodeViewWrapper className="tweet-embed">
      <Card
        className={cn(
          "group relative my-6 overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50",
          "dark:from-sky-950/30 dark:via-blue-950/30 dark:to-cyan-950/30",
          "border-l-4 border-l-blue-500 hover:border-l-blue-600",
          "shadow-sm hover:shadow-md",
          selected && "ring-2 ring-blue-500 ring-offset-2",
        )}
      >
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
            "text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400",
          )}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="relative p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Twitter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                  Tweet Embed
                </span>
                {hasValidTweet && (
                  <>
                    <div className="h-1 w-1 rounded-full bg-blue-400 dark:bg-blue-500" />
                    <a
                      href={node.attrs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => setInputUrl(node.attrs.url ?? "")}
                >
                  <Edit className="h-3 w-3" />
                  {hasValidTweet ? "Edit" : "Add URL"}
                </Button>
              </DialogTrigger>
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
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Input
                      id="tweetUrl"
                      value={inputUrl}
                      onChange={(e) => {
                        setInputUrl(e.target.value);
                        setError(null);
                      }}
                      placeholder="https://twitter.com/username/status/123456789"
                      className={cn(
                        "w-full",
                        error && "border-red-500 focus:border-red-500",
                      )}
                    />
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Embed Tweet"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Content */}
          <div className="relative">
            {!hasValidTweet ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Twitter className="mb-3 h-12 w-12 text-blue-400 dark:text-blue-500" />
                <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  No Tweet URL Set
                </h3>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Click &quot;Add URL&quot; to embed a tweet from Twitter/X
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="text-xs"
                >
                  Add Tweet URL
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <Tweet id={tweetId} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400" />
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
