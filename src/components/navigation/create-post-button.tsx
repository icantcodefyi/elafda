"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "~/hooks/use-auth";

export function CreatePostButton() {
  const { requireAuth, isSignedIn } = useAuth();

  const handleClick = () => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }
  };

  if (!isSignedIn) {
    return (
      <Button onClick={handleClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Button>
    );
  }

  return (
    <Button asChild>
      <Link href="/create">
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Link>
    </Button>
  );
}
