/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

export interface TiptapContent {
  type: "doc";
  content?: TiptapNode[];
}

export interface PostFormData {
  title: string;
  description: TiptapContent | null;
  lore?: string;
  tags: string[];
  tweetLinks: string[];
  images: string[];
}
