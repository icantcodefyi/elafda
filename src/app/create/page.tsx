/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MultiSelect } from "~/components/ui/multi-select";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { useAuth } from "~/hooks/use-auth";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import type { PostFormData, TiptapContent, TiptapNode } from "~/types/editor";

export default function CreatePostPage() {
  const router = useRouter();
  const { requireAuth, isSignedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostFormData>({
    title: "",
    description: null,
    lore: "",
    tags: [],
    tweetLinks: [],
    images: [],
  });

  // Extract tweet links and images from editor content
  const extractFromContent = (content: TiptapContent | null) => {
    const tweetLinks: string[] = [];
    const images: string[] = [];
    let lore = "";

    if (content?.content) {
      const traverse = (node: TiptapNode) => {
        if (node.type === "tweetEmbed" && node.attrs?.url) {
          tweetLinks.push(node.attrs.url as string);
        }
        if (node.type === "image" && node.attrs?.src) {
          images.push(node.attrs.src as string);
        }
        if (node.type === "loreBlock" && node.content) {
          // Extract text content from lore block
          lore = extractTextFromNode(node);
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      };
      content.content.forEach(traverse);
    }

    return { tweetLinks, images, lore };
  };

  const extractTextFromNode = (node: TiptapNode): string => {
    if (node.type === "text") {
      return node.text ?? "";
    }
    if (node.content) {
      return node.content.map(extractTextFromNode).join("");
    }
    return "";
  };

  const handleEditorChange = (content: TiptapContent | null) => {
    const extracted = extractFromContent(content);
    setPostData((prev) => ({
      ...prev,
      description: content,
      ...extracted,
    }));
  };

  const handleImageUpload = (url: string) => {
    setPostData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      requireAuth();
      return;
    }

    if (!postData.title.trim() || !postData.description) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const post = await response.json();
      router.push(`/e-lafda/${post.id}`);
    } catch (error) {
      console.error("Error creating post:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <Card className="bg-background/80 w-full max-w-md border-0 shadow-lg backdrop-blur">
          <CardContent className="p-8">
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Authentication Required
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You need to be signed in to create a post and share your story
                  with the community.
                </p>
              </div>
              <Button
                onClick={() => requireAuth()}
                size="lg"
                className="w-full"
              >
                Sign In to Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="from-background via-background to-muted/10 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header Section */}
        <div className="mb-8 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground text-lg">
            Share an incident, story, or interesting event with the community.
          </p>
        </div>

        <Card className="bg-background/80 border-0 shadow-xl backdrop-blur">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Title
                  </Label>
                  <span className="text-destructive text-xs font-medium">
                    *
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="What happened? Give it a catchy title..."
                  value={postData.title}
                  onChange={(e) =>
                    setPostData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="focus:border-primary h-12 border-2 text-base transition-colors"
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Tags</Label>
                <MultiSelect
                  values={postData.tags}
                  onChange={(tags) =>
                    setPostData((prev) => ({ ...prev, tags }))
                  }
                  placeholder="Add tags to help people discover your post..."
                />
                <p className="text-muted-foreground text-xs">
                  Add relevant tags to help others find your post. Add comma (,) to separate tags.
                </p>
              </div>

              {/* Content Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Content</Label>
                  <span className="text-destructive text-xs font-medium">
                    *
                  </span>
                </div>
                <div className="border-border focus-within:border-primary rounded-lg border-2 transition-colors">
                  <RichTextEditor
                    content={postData.description}
                    onChange={handleEditorChange}
                    onImageUpload={handleImageUpload}
                    placeholder="Tell your story... Use the toolbar to add formatting, lore blocks, tweet embeds, and images."
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Use the rich text editor to format your content, add images,
                  and embed tweets
                </p>
              </div>

              {/* Action Buttons */}
              <div className="border-border border-t pt-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !postData.title.trim() ||
                      !postData.description ||
                      isSubmitting
                    }
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Post...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Create Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
