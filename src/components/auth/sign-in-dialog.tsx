"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Chrome, Twitter, Loader2 } from "lucide-react";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign in failed:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      setIsTwitterLoading(true);
      await signIn("twitter", { callbackUrl: "/" });
    } catch (error) {
      console.error("Twitter sign in failed:", error);
    } finally {
      setIsTwitterLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in to your account to create and share e-lafdas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isTwitterLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium"
            onClick={handleTwitterSignIn}
            disabled={isGoogleLoading || isTwitterLoading}
          >
            {isTwitterLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Twitter className="mr-2 h-4 w-4" />
            )}
            Continue with Twitter
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
} 