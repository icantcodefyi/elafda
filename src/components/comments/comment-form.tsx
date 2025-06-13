"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
import { Loader2 } from "lucide-react";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitText?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  submitText = "Comment",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  return (
    <Card className="border-0 shadow-none py-0">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs">
            Supports Markdown formatting
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitText}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
