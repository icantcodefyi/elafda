/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { MultiSelect } from "~/components/ui/multi-select";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { useAuth } from "~/hooks/use-auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft,
  faPaperPlane,
  faSpinner,
  faEdit,
  faTag,
  faSignInAlt,
  faExclamationTriangle,
  faHeading,
  faAlignLeft
} from "@fortawesome/free-solid-svg-icons";
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-2xl">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 text-muted-foreground" />
                  </div>
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
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2 h-4 w-4" />
                    Sign In to Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FontAwesomeIcon icon={faEdit} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Post</h1>
                  <p className="text-muted-foreground text-sm">
                    Share an incident, story, or interesting event with the community.
                  </p>
                </div>
              </div>
              <Separator className="bg-border/50" />
            </CardHeader>
            
            <CardContent className="space-y-6 pt-0">
              <form className="space-y-6">
                {/* Title Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeading} className="h-4 w-4 text-muted-foreground" />
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
                    className="focus:border-primary h-12 text-base transition-colors"
                  />
                </div>

                <Separator className="bg-border/50" />

                {/* Tags Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTag} className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Tags</Label>
                  </div>
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

                <Separator className="bg-border/50" />

                {/* Content Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faAlignLeft} className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Content</Label>
                    <span className="text-destructive text-xs font-medium">
                      *
                    </span>
                  </div>
                  <div className="border-border focus-within:border-primary rounded-lg border transition-colors">
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

                <Separator className="bg-border/50" />

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
                    type="button"
                    onClick={handleSubmit}
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
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
                        Creating Post...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4" />
                        Create Post
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
