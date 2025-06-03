import { type ELafda, type ELafdaComment } from "~/types/e-lafda"

export const mockELafdaData: ELafda = {
  id: "1",
  title: "The Great Next.js vs React Debate of 2024",
  description: "A comprehensive discussion about the future of React and Next.js frameworks, featuring insights from developers worldwide and the latest performance benchmarks.",
  author: {
    id: "author-1", 
    username: "techguru42",
    displayName: "Tech Guru",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    verified: true
  },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T15:45:00Z",
  views: 12500,
  stars: 189,
  replies: 47,
  category: "Technology",
  tags: ["nextjs", "react", "webdev", "javascript", "performance"],
  isHot: true,
  isTrending: true,
  status: "active",
  tweets: [
    {
      id: "tweet-1",
      tweetId: "1629307668568633344", // Real tweet ID for demo
      authorId: "author-1",
      content: "Starting this heated debate about Next.js vs pure React. What are your thoughts? #NextJS #React",
      createdAt: "2024-01-15T10:30:00Z",
      order: 1
    },
    {
      id: "tweet-2", 
      tweetId: "1628832338187636740", // Another real tweet ID
      authorId: "author-2",
      content: "Hot take: Next.js is becoming too opinionated. Sometimes you just need React!",
      createdAt: "2024-01-15T11:15:00Z",
      order: 2
    },
    {
      id: "tweet-3",
      tweetId: "1647193298908397571", // Another real tweet ID
      authorId: "author-3", 
      content: "Performance benchmarks show Next.js 14 with app router is incredible for SEO and load times",
      createdAt: "2024-01-15T12:00:00Z",
      order: 3
    }
  ],
  polls: [
    {
      id: "poll-1",
      question: "Which framework do you prefer for large-scale applications?",
      options: [
        { id: "opt-1", text: "Next.js", votes: 1250, percentage: 62.5 },
        { id: "opt-2", text: "Pure React", votes: 600, percentage: 30.0 },
        { id: "opt-3", text: "Other", votes: 150, percentage: 7.5 }
      ],
      totalVotes: 2000,
      createdAt: "2024-01-15T13:00:00Z"
    }
  ],
  attachments: [
    {
      id: "att-1",
      type: "image",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      title: "Performance Comparison Chart",
      description: "Next.js vs React performance metrics"
    }
  ]
}

export const mockELafdaComments: ELafdaComment[] = [
  {
    id: "comment-1",
    content: "Great discussion! I've been using Next.js for 2 years and the developer experience is unmatched.",
    author: {
      id: "user-1",
      username: "devexpert",
      displayName: "Dev Expert",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2024-01-15T14:30:00Z",
    likes: 23,
    replies: [
      {
        id: "reply-1",
        content: "Totally agree! The file-based routing is a game changer.",
        author: {
          id: "user-2", 
          username: "codemaster",
          displayName: "Code Master",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150&h=150&fit=crop&crop=face"
        },
        createdAt: "2024-01-15T14:45:00Z",
        likes: 8,
        parentId: "comment-1"
      }
    ]
  },
  {
    id: "comment-2",
    content: "While Next.js is great, sometimes you need the flexibility of a custom React setup. It depends on the project requirements.",
    author: {
      id: "user-3",
      username: "reactninja",
      displayName: "React Ninja", 
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2024-01-15T15:00:00Z",
    likes: 15
  },
  {
    id: "comment-3",
    content: "The new app directory in Next.js 13+ changed everything. Server components are the future!",
    author: {
      id: "user-4",
      username: "fullstackdev",
      displayName: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
    },
    createdAt: "2024-01-15T16:15:00Z",
    likes: 31
  }
]

// Additional mock data for related e-lafdas
export const relatedELafdas: Omit<ELafda, 'tweets' | 'polls' | 'attachments'>[] = [
  {
    id: "2",
    title: "TypeScript vs JavaScript in 2024",
    description: "The ongoing debate about whether TypeScript is worth the complexity",
    author: {
      id: "author-2",
      username: "typescriptfan",
      displayName: "TypeScript Fan",
      verified: false
    },
    createdAt: "2024-01-10T09:00:00Z",
    views: 8900,
    stars: 156,
    replies: 89,
    category: "Technology",
    tags: ["typescript", "javascript", "webdev"],
    isHot: false,
    isTrending: true,
    status: "active"
  },
  {
    id: "3", 
    title: "The State of CSS in 2024",
    description: "Tailwind CSS vs CSS-in-JS vs traditional CSS - what's winning?",
    author: {
      id: "author-3",
      username: "csswizard", 
      displayName: "CSS Wizard",
      verified: true
    },
    createdAt: "2024-01-08T16:30:00Z",
    views: 6700,
    stars: 98,
    replies: 34,
    category: "Design",
    tags: ["css", "tailwind", "styling"],
    isHot: false,
    isTrending: false,
    status: "active"
  }
] 