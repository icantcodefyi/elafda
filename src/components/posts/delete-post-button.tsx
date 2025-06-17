"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faEllipsisVertical, 
  faSpinner,
  faExclamationTriangle 
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "~/hooks/use-auth";

interface DeletePostButtonProps {
  postSlug: string;
  postTitle: string;
  authorId: string;
}

export function DeletePostButton({ postSlug, postTitle, authorId }: DeletePostButtonProps) {
  const router = useRouter();
  const { user, isSignedIn } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");

  // Only show delete button if user owns the post or is admin
  if (!isSignedIn || (user?.id !== authorId && user?.role !== "ADMIN")) {
    return null;
  }

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.id === authorId;

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postSlug}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: deleteType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteDialog = (type: "soft" | "hard") => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner && (
            <DropdownMenuItem
              onClick={() => openDeleteDialog("soft")}
              className="text-destructive focus:text-destructive"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
              Delete Post
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <>
              <DropdownMenuItem
                onClick={() => openDeleteDialog("soft")}
                className="text-destructive focus:text-destructive"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                Soft Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog("hard")}
                className="text-destructive focus:text-destructive"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                Hard Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon={faExclamationTriangle} 
                className="text-destructive h-5 w-5" 
              />
              {deleteType === "hard" ? "Permanently Delete Post" : "Delete Post"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {deleteType === "hard" ? "permanently delete" : "delete"}{" "}
              &quot;{postTitle}&quot;?
              
              {deleteType === "hard" ? (
                <span className="text-destructive mt-2 font-medium block">
                  This action cannot be undone. The post will be permanently removed from the database.
                </span>
              ) : (
                <span className="mt-2 block">
                  The post will be hidden from users but can be restored by administrators.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                  {deleteType === "hard" ? "Permanently Delete" : "Delete Post"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 