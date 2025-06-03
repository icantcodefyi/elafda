"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const isSignedIn = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  const requireAuth = (callback?: () => void) => {
    if (isSignedIn) {
      callback?.();
    } else {
      setShowSignInDialog(true);
    }
  };

  return {
    user: session?.user,
    isSignedIn,
    isLoading,
    showSignInDialog,
    setShowSignInDialog,
    requireAuth,
  };
}
