"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "~/site-config";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Plus, Home } from "lucide-react";
import { useTheme } from "./theme-provider";

export function Header() {
  const { theme } = useTheme();
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center space-x-3 transition-opacity hover:opacity-80"
        >
          <div className="relative h-8 w-8">
            <img
              src={theme === "dark" ? "/logo-white.svg" : "/logo.svg"}
              alt={`${siteConfig.name} logo`}
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile navigation button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>

          {/* Create new e-lafda button */}
          <Button size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            New E-Lafda
          </Button>

          <Button size="icon" className="sm:hidden">
            <Plus className="h-4 w-4" />
            <span className="sr-only">New E-Lafda</span>
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
