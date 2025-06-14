# Post Creation System Documentation

## Overview
A complete post creation system for E-Lafda platform with rich text editing, custom blocks, image uploads, and tagging.

## Database Schema
- **Model**: `Post` in `prisma/schema.prisma`
- **Fields**: title, description (JSON), lore, tweetLinks[], images[], tags[], views, authorId

## API Endpoints

### Posts API
- **File**: `src/app/api/posts/route.ts`
- **Methods**: GET (list posts), POST (create post)
- **Features**: Auth validation, Zod schema validation, automatic view tracking

### File Upload
- **Files**: 
  - `src/app/api/uploadthing/core.ts` - Upload configuration
  - `src/app/api/uploadthing/route.ts` - Route handler
  - `src/lib/uploadthing.ts` - Client utilities

## Rich Text Editor

### Main Editor
- **File**: `src/components/editor/rich-text-editor.tsx`
- **Features**: Toolbar with formatting, custom blocks, image upload
- **Extensions**: StarterKit, Image, Placeholder, LoreBlock, TweetEmbed

### Custom Extensions

#### Lore Block
- **File**: `src/components/editor/lore-block.tsx`
- **Purpose**: Blue-themed blocks for incident background/context
- **Shortcut**: `Mod-Shift-L`

#### Tweet Embed
- **File**: `src/components/editor/tweet-embed.tsx`
- **Purpose**: Embed Twitter/X posts by URL
- **Features**: URL validation, edit/delete functionality

## UI Components

### Form Components
- **File**: `src/components/ui/multi-select.tsx` - Tag selection
- **File**: `src/components/ui/textarea.tsx` - Text input
- **File**: `src/components/ui/label.tsx` - Form labels

### Post Components
- **File**: `src/components/posts/post-renderer.tsx` - Render Tiptap content
- **File**: `src/components/posts/posts-list.tsx` - Display posts list
- **File**: `src/components/navigation/create-post-button.tsx` - Navigation button

## Pages

### Post Creation
- **File**: `src/app/create/page.tsx`
- **Features**: Form validation, auth protection, rich text editing

### Post Display
- **File**: `src/app/e-lafda/[id]/page.tsx`
- **Features**: Individual post view, view counting, content rendering

### Home Page
- **File**: `src/app/page.tsx`
- **Updated**: Added posts list and create post functionality

## Styling
- **File**: `src/styles/editor.css` - Tiptap editor styles
- **Import**: Added to `src/styles/globals.css`

## Types
- **File**: `src/types/editor.ts` - TypeScript definitions for Tiptap content

## Dependencies Added
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`
- `uploadthing`, `react-tweet`
- `date-fns`, `zod`

## Key Features
1. **Rich Text Editor** with custom extensions
2. **Image Upload** with UploadThing integration
3. **Tagging System** with multi-select UI
4. **Custom Lore Blocks** for incident context
5. **Tweet Embedding** with URL validation
6. **Authentication** protection
7. **View Tracking** for posts
8. **Responsive Design** with shadcn/ui

## Reaction System

### Database
- **Model**: `Reaction` in `prisma/schema.prisma`
- **Fields**: id, type (enum), userId, postId, timestamps
- **Constraint**: Unique per user per post (one reaction only)
- **Types**: LIKE, DISLIKE, FIRE, HEART, CRY

### API Endpoints
- **File**: `src/app/api/reactions/route.ts`
- **Methods**: GET (fetch counts), POST (add/update), DELETE (remove)
- **Features**: Auth protection, optimistic updates

### Components
- **File**: `src/components/posts/reaction-buttons.tsx`
- **Features**: Emoji buttons, counts display, auth integration
- **File**: `src/hooks/use-reactions.ts` - Custom hook for state management
- **File**: `src/types/reactions.ts` - TypeScript types and constants

### Integration
- Added to post display page (`src/app/e-lafda/[id]/page.tsx`)
- Added to posts list (`src/components/posts/posts-list.tsx`)

## Comment System

### Database
- **Models**: `Comment`, `CommentVote` in `prisma/schema.prisma`
- **Comment Fields**: id, content (markdown), postId, userId, parentId, timestamps
- **Vote Fields**: id, type (UPVOTE/DOWNVOTE), userId, commentId, timestamps
- **Features**: Nested comments (parent-child), voting system, user ownership

### API Endpoints
- **File**: `src/app/api/comments/route.ts` - GET (fetch), POST (create)
- **File**: `src/app/api/comments/[id]/route.ts` - DELETE (owner/admin only)
- **File**: `src/app/api/comments/votes/route.ts` - POST (vote), DELETE (remove vote)
- **Features**: Auth protection, nested structure, vote counting

### Components
- **File**: `src/components/comments/comments-section.tsx` - Main container
- **File**: `src/components/comments/comment-item.tsx` - Individual comment display
- **File**: `src/components/comments/comment-form.tsx` - Create/reply form
- **File**: `src/hooks/use-comments.ts` - State management hook
- **File**: `src/types/comments.ts` - TypeScript definitions

### Features
1. **Markdown Support** - Full GitHub Flavored Markdown with sanitization
2. **Nested Replies** - Up to 3 levels deep with visual indentation
3. **Voting System** - Reddit-style upvote/downvote with score display
4. **User Management** - Delete own comments, admin can delete any
5. **Real-time Counts** - Dynamic comment and vote count updates
6. **Authentication** - Sign-in required for commenting and voting

### Integration
- Added to post display page with full comment thread
- Markdown rendering with `react-markdown`, `remark-gfm`, `rehype-sanitize`

## Usage
1. Navigate to `/create` to create posts
2. Use toolbar for formatting and custom blocks
3. Upload images directly in editor
4. Add tags for categorization
5. View posts at `/e-lafda/[id]`
6. Browse all posts on home page
7. **React to posts** with emoji buttons (requires authentication)
8. **Comment on posts** with markdown support and nested replies
9. **Vote on comments** with upvote/downvote system 