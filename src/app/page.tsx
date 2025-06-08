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
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">E-Lafdas</h1>
      </div>

      {/* Posts List */}
      <PostsList
        posts={posts.map((post) => ({
          ...post,
          createdAt: post.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
