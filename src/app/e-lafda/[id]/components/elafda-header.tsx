import Link from "next/link";
import {
  Star,
  Eye,
  MessageCircle,
  Share2,
  Clock,
  CheckCircle,
  TrendingUp,
  Flame,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { formatRelativeTime, formatNumber, calculateReadingTime } from "~/lib/utils";

interface ELafdaHeaderProps {
  post: {
    id: string;
    title: string;
    description: string | null;
    lafdaDate: Date;
    severity: string;
    category: string;
    tags: string[];
    views: number;
    upvotes: number;
    downvotes: number;
    createdAt: Date;
    creator: {
      id: string;
      name: string | null;
      image: string | null;
    };
    postAccounts: Array<{
      account: {
        username: string;
        displayName: string;
        profileImage: string | null;
        isVerified: boolean;
      };
      role: string;
    }>;
  };
  commentsCount: number;
}

export function ELafdaHeader({ post, commentsCount }: ELafdaHeaderProps) {
  const readingTime = calculateReadingTime(post.description ?? "");
  const isHot = post.severity === "HIGH" || post.severity === "CRITICAL";
  const isTrending = post.views > 1000; // Simple trending logic

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to E-Lafda Directory
      </Link>

      {/* Title and Status */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {isHot && (
            <Badge variant="destructive" className="text-xs">
              <Flame className="mr-1 h-3 w-3" />
              Hot
            </Badge>
          )}
          {isTrending && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="mr-1 h-3 w-3" />
              Trending
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {post.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            {readingTime} min read
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {post.severity.toLowerCase()}
          </Badge>
        </div>

        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-muted-foreground text-xl leading-relaxed">
            {post.description}
          </p>
        )}
      </div>

      {/* Author and Meta Info */}
      <div className="bg-muted/30 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={post.creator.image ?? ""}
              alt={post.creator.name ?? "Anonymous"}
            />
            <AvatarFallback>
              {(post.creator.name ?? "A").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{post.creator.name ?? "Anonymous"}</span>
            </div>
            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatRelativeTime(post.createdAt)}
              </span>
              <span>
                Lafda Date: {formatRelativeTime(post.lafdaDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-muted-foreground flex items-center space-x-6 text-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(post.views)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{post.views.toLocaleString()} views</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{formatNumber(post.upvotes)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{post.upvotes.toLocaleString()} upvotes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(commentsCount)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{commentsCount.toLocaleString()} comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Involved Accounts */}
      {post.postAccounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Accounts Involved</h3>
          <div className="flex flex-wrap gap-3">
            {post.postAccounts.map((postAccount, index) => (
              <div key={index} className="flex items-center space-x-2 rounded-lg border p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={postAccount.account.profileImage ?? ""}
                    alt={postAccount.account.displayName}
                  />
                  <AvatarFallback>
                    {postAccount.account.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{postAccount.account.displayName}</span>
                    {postAccount.account.isVerified && (
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                    <span>@{postAccount.account.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {postAccount.role.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button size="sm" className="flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span>Upvote</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Join Discussion</span>
        </Button>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 