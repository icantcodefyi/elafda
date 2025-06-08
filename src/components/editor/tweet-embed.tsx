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
  MessageSquare,
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
          "group relative mb-4 transition-all duration-200 py-0",
          "bg-muted/50 hover:bg-muted/70",
          "border border-border hover:border-muted-foreground/20",
          "shadow-sm hover:shadow-md",
          selected && "ring-2 ring-ring ring-offset-2",
        )}
      >
        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteNode()}
          className={cn(
            "absolute top-2 right-2 z-10 h-6 w-6 rounded-md p-0",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="relative p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background border">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Tweet Embed
              </span>
              {hasValidTweet && (
                <>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  <a
                    href={node.attrs.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setInputUrl(node.attrs.url ?? "")}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {hasValidTweet ? "Edit" : "Add URL"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Twitter className="h-5 w-5" />
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
                        error && "border-destructive focus:border-destructive",
                      )}
                    />
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
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
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  No Tweet URL Set
                </h3>
                <p className="mb-4 text-xs text-muted-foreground max-w-sm">
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
              <div className="w-full [&_.react-tweet-theme]:bg-background [&_.react-tweet-theme]:border-border">
                <Tweet id={tweetId} />
              </div>
            )}
          </div>
        </div>
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
