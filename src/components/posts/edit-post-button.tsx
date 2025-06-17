"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "~/hooks/use-auth";

interface EditPostButtonProps {
  postSlug: string;
  authorId: string;
  collaboratorIds?: string[];
}

export function EditPostButton({ postSlug, authorId, collaboratorIds = [] }: EditPostButtonProps) {
  const { user, isSignedIn } = useAuth();

  // Check if user can edit: owner, collaborator, or admin
  const isOwner = user?.id === authorId;
  const isCollaborator = collaboratorIds.includes(user?.id ?? "");
  const isAdmin = user?.role === "ADMIN";

  if (!isSignedIn || (!isOwner && !isCollaborator && !isAdmin)) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/edit/${postSlug}`}>
        <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
        <span className="hidden sm:inline">Edit Post</span>
      </Link>
    </Button>
  );
} 