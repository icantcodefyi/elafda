"use client";

import * as React from "react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Palette, Plus, User } from "lucide-react";

import { Button } from "@acme/ui/button";

import { auth } from "~/auth/server";
import { UserButton } from "./auth/user-button";

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          >
            <div className="relative size-8">
              <Image
                src={"/logo.svg"}
                alt={`Logo`}
                width={32}
                height={32}
                className="size-8 dark:hidden"
              />
              <Image
                src={"/logo.svg"}
                alt={`Logo`}
                width={32}
                height={32}
                className="hidden size-8 dark:block"
              />
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Button size="sm" className="flex">
              <Plus className="h-4 w-4" />
              <span className="max-sm:sr-only">New E-Lafda</span>
            </Button>

            <UserButton />
          </div>
        </div>
      </header>
    </>
  );
}
