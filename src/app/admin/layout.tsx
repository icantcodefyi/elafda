"use client";

import { useAuth } from "~/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isSignedIn || !isAdmin)) {
      router.push("/");
    }
  }, [isSignedIn, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
