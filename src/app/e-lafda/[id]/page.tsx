import { Suspense } from "react";
import { Tweet } from "react-tweet";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
import Link from "next/link";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import {
  mockELafdaData,
  mockELafdaComments,
  relatedELafdas,
} from "~/lib/mock-data";
import {
  formatRelativeTime,
  formatNumber,
  calculateReadingTime,
} from "~/lib/utils";
import type { ELafda, ELafdaComment } from "~/types/e-lafda";

interface ELafdaPageProps {
  params: {
    id: string;
  };
}

// Mock function to fetch e-lafda data - replace with real API call
async function getELafdaById(id: string): Promise<ELafda | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (id === "1") {
    return mockELafdaData;
  }

  return null;
}

// Metadata generation
export async function generateMetadata({
  params,
}: ELafdaPageProps): Promise<Metadata> {
  const elafda = await getELafdaById(params.id);

  if (!elafda) {
    return {
      title: "E-Lafda Not Found",
      description: "The requested e-lafda could not be found.",
    };
  }

  return {
    title: `${elafda.title} | E-Lafda`,
    description: elafda.description,
    keywords: elafda.tags.join(", "),
    authors: [
      { name: elafda.author.displayName, url: `/@${elafda.author.username}` },
    ],
    openGraph: {
      title: elafda.title,
      description: elafda.description,
      type: "article",
      publishedTime: elafda.createdAt,
      modifiedTime: elafda.updatedAt,
      authors: [elafda.author.displayName],
      tags: elafda.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: elafda.title,
      description: elafda.description,
      creator: `@${elafda.author.username}`,
    },
  };
}

function ELafdaHeader({ elafda }: { elafda: ELafda }) {
  const tweetContent = elafda.tweets?.map((t) => t.content).join(" ") ?? "";
  const readingTime = calculateReadingTime(elafda.description + tweetContent);

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
          {elafda.isHot && (
            <Badge variant="destructive" className="text-xs">
              <Flame className="mr-1 h-3 w-3" />
              Hot
            </Badge>
          )}
          {elafda.isTrending && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="mr-1 h-3 w-3" />
              Trending
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {elafda.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            {readingTime} min read
          </Badge>
        </div>

        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
          {elafda.title}
        </h1>

        <p className="text-muted-foreground text-xl leading-relaxed">
          {elafda.description}
        </p>
      </div>

      {/* Author and Meta Info */}
      <div className="bg-muted/30 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={elafda.author.avatar}
              alt={elafda.author.displayName}
            />
            <AvatarFallback>
              {elafda.author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{elafda.author.displayName}</span>
              {elafda.author.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <span>@{elafda.author.username}</span>
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatRelativeTime(elafda.createdAt)}
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
                <span>{formatNumber(elafda.views)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{elafda.views.toLocaleString()} views</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{formatNumber(elafda.stars)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{elafda.stars.toLocaleString()} stars</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(elafda.replies)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{elafda.replies.toLocaleString()} replies</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button size="sm" className="flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span>Star</span>
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
      {elafda.tags && elafda.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {elafda.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function TweetSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="border-border space-y-3 rounded-lg border p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-muted h-10 w-10 rounded-full"></div>
          <div className="space-y-2">
            <div className="bg-muted h-4 w-32 rounded"></div>
            <div className="bg-muted h-3 w-24 rounded"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-4 w-full rounded"></div>
          <div className="bg-muted h-4 w-3/4 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function EmbeddedTweet({ tweetId }: { tweetId: string }) {
  return (
    <div className="my-6">
      <Suspense fallback={<TweetSkeleton />}>
        <Tweet id={tweetId} />
      </Suspense>
    </div>
  );
}

function CommentCard({ comment }: { comment: ELafdaComment }) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.author.avatar}
            alt={comment.author.displayName}
          />
          <AvatarFallback>
            {comment.author.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {comment.author.displayName}
            </span>
            <span className="text-muted-foreground text-xs">
              @{comment.author.username}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              <Star className="mr-1 h-3 w-3" />
              {comment.likes}
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-muted ml-11 space-y-4 border-l-2 pl-4">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

function PollComponent({ poll }: { poll: NonNullable<ELafda["polls"]>[0] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
        <CardDescription>
          {formatNumber(poll.totalVotes)} votes • Created{" "}
          {formatRelativeTime(poll.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{option.text}</span>
              <span>{option.percentage}%</span>
            </div>
            <div className="bg-secondary h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {formatNumber(option.votes)} votes
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function ELafdaPage({ params }: ELafdaPageProps) {
  const elafda = await getELafdaById(params.id);

  if (!elafda) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <ELafdaHeader elafda={elafda} />

        <Separator className="my-8" />

        {/* Main Content */}
        <Tabs defaultValue="discussion" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="tweets">
              Tweets ({elafda.tweets?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="polls">
              Polls ({elafda.polls?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="discussion" className="space-y-6">
            {/* Attachments */}
            {elafda.attachments && elafda.attachments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Attachments</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {elafda.attachments.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardContent className="p-4">
                        {attachment.type === "image" && (
                          <div className="space-y-2">
                            <Image
                              src={attachment.url}
                              alt={attachment.title ?? ""}
                              width={400}
                              height={200}
                              className="w-full rounded-lg object-cover"
                            />
                            {attachment.title && (
                              <p className="font-medium">{attachment.title}</p>
                            )}
                            {attachment.description && (
                              <p className="text-muted-foreground text-sm">
                                {attachment.description}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Discussion ({mockELafdaComments.length})
                </h3>
                <Button size="sm">Add Comment</Button>
              </div>

              <div className="space-y-6">
                {mockELafdaComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tweets" className="space-y-6">
            {elafda.tweets && elafda.tweets.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Related Tweets</h3>
                {elafda.tweets
                  .sort((a, b) => a.order - b.order)
                  .map((tweet) => (
                    <EmbeddedTweet key={tweet.id} tweetId={tweet.tweetId} />
                  ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No tweets yet</h3>
                <p className="text-muted-foreground">
                  This e-lafda doesn&apos;t have any associated tweets.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="polls" className="space-y-6">
            {elafda.polls && elafda.polls.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Community Polls</h3>
                {elafda.polls.map((poll) => (
                  <PollComponent key={poll.id} poll={poll} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No polls yet</h3>
                <p className="text-muted-foreground">
                  This e-lafda doesn&apos;t have any community polls.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <h3 className="text-lg font-semibold">Related E-Lafdas</h3>
            <div className="grid gap-4">
              {relatedELafdas.map((related) => (
                <Card
                  key={related.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-2">
                          <Link
                            href={`/e-lafda/${related.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {related.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {related.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {formatNumber(related.views)}
                        </span>
                        <span className="flex items-center">
                          <Star className="mr-1 h-3 w-3" />
                          {formatNumber(related.stars)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {formatNumber(related.replies)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {related.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
