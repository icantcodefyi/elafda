import { Card, CardHeader } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>

        {/* Header Skeleton */}
        <div className="space-y-6 mb-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="h-5 bg-muted rounded w-12"></div>
            <div className="h-5 bg-muted rounded w-16"></div>
            <div className="h-5 bg-muted rounded w-20"></div>
            <div className="h-5 bg-muted rounded w-24"></div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-full"></div>
            <div className="h-6 bg-muted rounded w-2/3"></div>
          </div>

          {/* Author Info Card */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="h-4 bg-muted rounded w-12"></div>
                <div className="h-4 bg-muted rounded w-12"></div>
                <div className="h-4 bg-muted rounded w-12"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="h-5 bg-muted rounded w-16"></div>
            <div className="h-5 bg-muted rounded w-12"></div>
            <div className="h-5 bg-muted rounded w-20"></div>
            <div className="h-5 bg-muted rounded w-14"></div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 gap-2">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>

              {/* Comment Cards */}
              {[1, 2, 3].map((index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-3 bg-muted rounded w-16"></div>
                          <div className="h-3 bg-muted rounded w-12"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-muted rounded w-12"></div>
                          <div className="h-6 bg-muted rounded w-12"></div>
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
  )
} 