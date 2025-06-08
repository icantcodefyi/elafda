/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { PostRenderer } from "~/components/posts/post-renderer";
import { ReactionButtons } from "~/components/posts/reaction-buttons";
import { CommentsSection } from "~/components/comments/comments-section";
import { db } from "~/server/db";
import { formatDistanceToNow } from "date-fns";
import type { TiptapContent } from "~/types/editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faClock, 
  faUser, 
  faTag,
  faComment,
  faHeart,
  faShare
} from "@fortawesome/free-solid-svg-icons";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  const post = await db.post.findFirst({
    where: {
      id,
      isDeleted: false, // Only show non-deleted posts
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  // Increment view count
  await db.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return post;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Back to Home Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline"
          >
            Back to Home
          </Link>

          {/* Main Post Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-6 pb-4">
              {/* Post Title */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                  {post.title}
                </h1>
                
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="flex items-center gap-1 text-xs"
                      >
                        <FontAwesomeIcon icon={faTag} className="h-2.5 w-2.5" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-border/50" />

              {/* Author and Meta Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-border/20">
                    <AvatarImage 
                      src={post.author?.image ?? undefined} 
                      alt={post.author?.name ?? "User avatar"}
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-medium text-foreground">
                      {post.author?.name ?? "Anonymous User"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* View Count */}
                <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5">
                  <FontAwesomeIcon 
                    icon={faEye} 
                    className="h-3.5 w-3.5 text-muted-foreground" 
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {post.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              {/* Post Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <PostRenderer
                  content={post.description as unknown as TiptapContent}
                />
              </div>

              <Separator className="bg-border/50" />

              {/* Interaction Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeart} className="h-4 w-4 text-muted-foreground" />
                    Reactions
                  </h3>
                </div>
                <ReactionButtons postId={post.id} />
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FontAwesomeIcon icon={faComment} className="h-4 w-4 text-muted-foreground" />
                Discussion
              </h2>
            </CardHeader>
            <CardContent className="pt-0">
              <CommentsSection postId={post.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
