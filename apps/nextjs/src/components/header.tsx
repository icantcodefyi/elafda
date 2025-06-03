"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@acme/ui/button";
import { SignInDialog } from "./auth/sign-in-dialog";
import { Plus, LogOut, User, Palette } from "lucide-react";
import { auth } from '~/auth/server';
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export function Header() {
    const handleSignOut = async () => {
        "use server";
        await auth.api.signOut({
            headers: await headers(),
        });
        redirect("/");
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
                                className="size-8 hidden dark:block"
                            />
                        </div>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            className="flex"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="max-sm:sr-only">New E-Lafda</span>
                        </Button>


                        {!isSignedIn && <ThemeToggle />}
                    </div>
                </div>
            </header>
        </>
    );
}