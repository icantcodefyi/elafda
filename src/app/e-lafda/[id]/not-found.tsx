import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertCircle, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="text-muted-foreground h-24 w-24" />
              </div>
              <CardTitle className="text-3xl">E-Lafda Not Found</CardTitle>
              <CardDescription className="text-lg">
                The e-lafda you&apos;re looking for doesn&apos;t exist or may
                have been removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">This could happen if:</p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• The e-lafda ID is incorrect</li>
                  <li>• The e-lafda has been deleted</li>
                  <li>• You don&apos;t have permission to view this content</li>
                </ul>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Back to Directory</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/" className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search E-Lafdas</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
