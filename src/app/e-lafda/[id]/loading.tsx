import { Card, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl animate-pulse">
        {/* Back Button Skeleton */}
        <div className="bg-muted mb-6 h-6 w-48 rounded"></div>

        {/* Header Skeleton */}
        <div className="mb-8 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-muted h-5 w-12 rounded"></div>
            <div className="bg-muted h-5 w-16 rounded"></div>
            <div className="bg-muted h-5 w-20 rounded"></div>
            <div className="bg-muted h-5 w-24 rounded"></div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="bg-muted h-10 w-3/4 rounded"></div>
            <div className="bg-muted h-10 w-1/2 rounded"></div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="bg-muted h-6 w-full rounded"></div>
            <div className="bg-muted h-6 w-2/3 rounded"></div>
          </div>

          {/* Author Info Card */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-muted h-12 w-12 rounded-full"></div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-32 rounded"></div>
                  <div className="bg-muted h-3 w-24 rounded"></div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="bg-muted h-4 w-12 rounded"></div>
                <div className="bg-muted h-4 w-12 rounded"></div>
                <div className="bg-muted h-4 w-12 rounded"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <div className="bg-muted h-8 w-16 rounded"></div>
            <div className="bg-muted h-8 w-16 rounded"></div>
            <div className="bg-muted h-8 w-24 rounded"></div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-muted h-5 w-16 rounded"></div>
            <div className="bg-muted h-5 w-12 rounded"></div>
            <div className="bg-muted h-5 w-20 rounded"></div>
            <div className="bg-muted h-5 w-14 rounded"></div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 gap-2">
            <div className="bg-muted h-10 rounded"></div>
            <div className="bg-muted h-10 rounded"></div>
            <div className="bg-muted h-10 rounded"></div>
            <div className="bg-muted h-10 rounded"></div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-muted h-6 w-32 rounded"></div>
                <div className="bg-muted h-8 w-24 rounded"></div>
              </div>

              {/* Comment Cards */}
              {[1, 2, 3].map((index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex space-x-3">
                      <div className="bg-muted h-8 w-8 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-muted h-4 w-24 rounded"></div>
                          <div className="bg-muted h-3 w-16 rounded"></div>
                          <div className="bg-muted h-3 w-12 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-muted h-4 w-full rounded"></div>
                          <div className="bg-muted h-4 w-3/4 rounded"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-muted h-6 w-12 rounded"></div>
                          <div className="bg-muted h-6 w-12 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
