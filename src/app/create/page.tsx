/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MultiSelect } from "~/components/ui/multi-select";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { useAuth } from "~/hooks/use-auth";
import { Loader2, Send } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to create a post.
              </p>
              <Button onClick={() => requireAuth()}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Share an incident, story, or interesting event with the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What happened? Give it a catchy title..."
                value={postData.title}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <MultiSelect
                values={postData.tags}
                onChange={(tags) => setPostData((prev) => ({ ...prev, tags }))}
                placeholder="Add tags to help people discover your post..."
              />
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                content={postData.description}
                onChange={handleEditorChange}
                onImageUpload={handleImageUpload}
                placeholder="Tell your story... Use the toolbar to add formatting, lore blocks, tweet embeds, and images."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
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
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
