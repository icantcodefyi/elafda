"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "~/hooks/use-auth";

interface EditPostButtonProps {
  postSlug: string;
  authorId: string;
}

export function EditPostButton({ postSlug, authorId }: EditPostButtonProps) {
  const { user, isSignedIn } = useAuth();

  // Only show edit button if user owns the post or is admin
  if (!isSignedIn || (user?.id !== authorId && user?.role !== "ADMIN")) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/edit/${postSlug}`}>
        <FontAwesomeIcon icon={faEdit} className="mr-2 h-3.5 w-3.5" />
        Edit Post
      </Link>
    </Button>
  );
} 