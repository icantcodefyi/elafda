import { type Post } from "~/types/posts";

export interface PostWithReactions extends Post {
  heartReactions: number;
}


export function rankPostsByHeartReactions(posts: Post[]): PostWithReactions[] {
  
  const postsWithReactions: PostWithReactions[] = posts.map((post) => ({
    ...post,
    heartReactions: 0, // This would be fetched from the reactions API
  }));

  // Sort by heart reactions count (descending)
  return postsWithReactions.sort((a, b) => b.heartReactions - a.heartReactions);
}


export async function getHeartReactionCount(postId: string): Promise<number> {
  try {
    const response = await fetch(`/api/reactions?postId=${postId}`);
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data.counts?.HEART || 0;
  } catch (error) {
    console.error(`Error fetching heart reactions for post ${postId}:`, error);
    return 0;
  }
}


export async function getRankedPosts(posts: Post[]): Promise<PostWithReactions[]> {

  const postsWithReactions = await Promise.all(
    posts.map(async (post) => {
      const heartReactions = await getHeartReactionCount(post.id);
      return {
        ...post,
        heartReactions,
      };
    })
  );

  // Sort by heart reactions count (descending)
  return postsWithReactions.sort((a, b) => b.heartReactions - a.heartReactions);
} 