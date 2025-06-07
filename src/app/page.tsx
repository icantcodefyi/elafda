import { PostsList } from "~/components/posts/posts-list";
import { CreatePostButton } from "~/components/navigation/create-post-button";
import { db } from "~/server/db";

async function getPosts() {
  const posts = await db.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return posts;
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">E-Lafda</h1>
            <p className="text-muted-foreground mt-2">
              Share incidents, stories, and interesting events with the
              community
            </p>
          </div>
          <CreatePostButton />
        </div>

        {/* Posts List */}
        <PostsList
          posts={posts.map((post) => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
