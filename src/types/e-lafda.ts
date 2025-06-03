export interface ELafda {
  id: string
  title: string
  description: string
  author: {
    id: string
    username: string
    displayName: string
    avatar?: string
    verified?: boolean
  }
  createdAt: string
  updatedAt?: string
  views: number
  stars: number
  replies: number
  category: string
  tags: string[]
  isHot: boolean
  isTrending: boolean
  status: 'active' | 'closed' | 'archived'
  tweets?: ELafdaTweet[]
  polls?: ELafdaPoll[]
  attachments?: ELafdaAttachment[]
}

export interface ELafdaTweet {
  id: string
  tweetId: string
  authorId: string
  content: string
  createdAt: string
  order: number
}

export interface ELafdaPoll {
  id: string
  question: string
  options: ELafdaPollOption[]
  totalVotes: number
  expiresAt?: string
  createdAt: string
}

export interface ELafdaPollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export interface ELafdaAttachment {
  id: string
  type: 'image' | 'video' | 'document'
  url: string
  title?: string
  description?: string
  size?: number
}

export interface ELafdaComment {
  id: string
  content: string
  author: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  createdAt: string
  likes: number
  replies?: ELafdaComment[]
  parentId?: string
}

export interface ELafdaStats {
  views: number
  stars: number
  replies: number
  shares: number
} 