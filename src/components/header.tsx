/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "~/site-config";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SignInDialog } from "~/components/auth/sign-in-dialog";
import { Plus, LogOut, User, Palette, Shield } from "lucide-react";
import { useAuth } from "~/hooks/use-auth";
import { signOut } from "next-auth/react";

export function Header() {
  const {
    user,
    isSignedIn,
    isLoading,
    showSignInDialog,
    setShowSignInDialog,
    requireAuth,
  } = useAuth();

  const handleNewELafda = () => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          >
            <div className="relative h-8 w-8">
              <img
                src="/logo.svg"
                alt={`${siteConfig.name} logo`}
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {isSignedIn ? (
              <>
                <Button size="sm" className="hidden sm:flex" asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    New E-Lafda
                  </Link>
                </Button>

                <Button className="h-8 w-8 sm:hidden" asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">New E-Lafda</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="hidden sm:flex"
                  onClick={handleNewELafda}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  New E-Lafda
                </Button>

                <Button
                  className="h-8 w-8 sm:hidden"
                  onClick={handleNewELafda}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New E-Lafda</span>
                </Button>
              </>
            )}

            {/* User avatar with dropdown */}
            {isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? "User"}
                      />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user.name ?? "User"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => console.log("Profile clicked")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <div className="relative flex cursor-default items-center justify-between rounded-sm px-2 text-sm outline-none select-none">
                    <div className="flex items-center">
                      <Palette className="dark:text-muted-foreground mr-2 h-4 w-4" />
                      <span className="ml-2 text-sm">Theme</span>
                    </div>
                    <ThemeToggle className="scale-75" />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {/* Theme toggle for non-authenticated users only */}
            {!isSignedIn && <ThemeToggle />}
          </div>
        </div>
      </header>

      {/* Sign in dialog */}
      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
    </>
  );
}
