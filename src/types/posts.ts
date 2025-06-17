export interface PostAuthor {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  description?: unknown;
  tags: string[];
  views: number;
  createdAt: string;
  author: PostAuthor;
}

export interface AdminPost extends Post {
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  author: PostAuthor & {
    email: string | null;
  };
  _count: {
    comments: number;
    reactions: number;
  };
}

export interface PostsPagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  totalPages?: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: PostsPagination;
}

export interface AdminPostsResponse {
  posts: AdminPost[];
  pagination: PostsPagination;
} 