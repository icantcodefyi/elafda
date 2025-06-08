"use client";

import { PostsList } from "~/components/posts/posts-list";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">E-Lafdas</h1>
      </div>

      {/* Posts List */}
      <PostsList />
    </div>
  );
}
