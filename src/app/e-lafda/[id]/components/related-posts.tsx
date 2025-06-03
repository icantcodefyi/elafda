import Link from "next/link";
import { Eye, Star, MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatNumber, formatRelativeTime } from "~/lib/utils";

interface RelatedPost {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  views: number;
  upvotes: number;
  createdAt: Date;
  _count: {
    postAccounts: number;
  };
}

interface RelatedPostsProps {
  relatedPosts: RelatedPost[];
}

export function RelatedPosts({ relatedPosts }: RelatedPostsProps) {
  if (relatedPosts.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">No related posts found</h3>
        <p className="text-muted-foreground">
          We couldn&apos;t find any related e-lafdas at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Related E-Lafdas</h3>
      <div className="grid gap-4">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <Badge 
                      variant={post.severity === "HIGH" || post.severity === "CRITICAL" ? "destructive" : "secondary"} 
                      className="text-xs capitalize"
                    >
                      {post.severity.toLowerCase()}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/e-lafda/${post.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  {post.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {post.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    {formatNumber(post.views)}
                  </span>
                  <span className="flex items-center">
                    <Star className="mr-1 h-3 w-3" />
                    {formatNumber(post.upvotes)}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="mr-1 h-3 w-3" />
                    {formatNumber(post._count.postAccounts)}
                  </span>
                </div>
                <span className="text-xs">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 