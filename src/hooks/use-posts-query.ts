import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface Post {
  id: string;
  title: string;
  slug: string;
  description: unknown;
  tags: string[];
  views: number;
  createdAt: string;
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

// Query key factory
const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
};

// API functions
async function fetchPosts(page = 1, limit = 20): Promise<PostsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
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

// Hooks
export function usePostsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: postKeys.list({ page, limit }),
    queryFn: () => fetchPosts(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePostQuery(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => fetchPost(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useIncrementPostViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementPostViews,
    onSuccess: (_, postId) => {
      // Optimistically update the post's view count
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old) => {
        if (old) {
          return { ...old, views: old.views + 1 };
        }
        return old;
      });

      // Also update in the posts list if it exists
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
