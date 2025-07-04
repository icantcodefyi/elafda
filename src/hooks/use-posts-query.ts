import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  slug: string;
  description: unknown;
  tags: string[];
  views: number;
  createdAt: string;
  heartReactions?: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
};

async function fetchPosts(page = 1, limit = 10, ranked = false): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(ranked && { ranked: "true" }),
  });

  const response = await fetch(`/api/posts?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json() as Promise<PostsResponse>;
}

async function fetchPost(slug: string): Promise<Post> {
  const response = await fetch(`/api/posts/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json() as Promise<Post>;
}

async function incrementPostViews(postId: string): Promise<void> {
  const response = await fetch(`/api/posts/${postId}/views`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to increment views");
  }
}

export function usePostsQuery(page = 1, limit = 10, ranked = false) {
  return useQuery({
    queryKey: postKeys.list({ page, limit, ranked }),
    queryFn: () => fetchPosts(page, limit, ranked),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePostQuery(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => fetchPost(slug),
    staleTime: 10 * 60 * 1000,
  });
}

export function useIncrementPostViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementPostViews,
    onSuccess: (_, postId) => {
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old) => {
        if (old) {
          return { ...old, views: old.views + 1 };
        }
        return old;
      });

      queryClient.setQueriesData<PostsResponse>(
        { queryKey: postKeys.lists() },
        (old) => {
          if (old) {
            return {
              ...old,
              posts: old.posts.map((post) =>
                post.id === postId ? { ...post, views: post.views + 1 } : post,
              ),
            };
          }
          return old;
        },
      );
    },
  });
}
