# Admin Moderation System

## Overview

The E-Lafda platform includes a comprehensive admin moderation system that allows administrators to manage users, posts, and comments. The system provides both soft and hard deletion capabilities, user role management, and detailed analytics.

## Features

### 🛡️ Admin Dashboard
- **Statistics Overview**: Real-time platform metrics including user counts, post counts, comment counts, and engagement metrics
- **Recent Activity**: Timeline of recent user registrations, posts, and comments
- **Quick Actions**: Direct access to moderation tools

### 👥 User Management
- **User Listing**: Paginated list of all users with search and filtering capabilities
- **Role Management**: Change user roles between USER, ADMIN, and BANNED
- **User Analytics**: View user activity including post count, comment count, and reaction count
- **Ban System**: Soft ban users by changing their role to BANNED

### 📝 Post Management
- **Post Listing**: View all posts with author information and engagement metrics
- **Content Moderation**: Soft delete or hard delete posts
- **Search & Filter**: Search by title/tags and filter by deletion status
- **Post Restoration**: Restore soft-deleted posts

### 💬 Comment Management
- **Comment Listing**: View all comments with context and user information
- **Comment Moderation**: Soft delete or hard delete comments
- **Search & Filter**: Search by content/user and filter by deletion status
- **Comment Restoration**: Restore soft-deleted comments

## Database Schema

### User Roles
```prisma
enum UserRole {
  USER
  ADMIN
  BANNED
}
```

### Soft Deletion Fields
Added to both Post and Comment models:
```prisma
isDeleted   Boolean  @default(false)
deletedAt   DateTime?
deletedBy   String?  // Admin who deleted
```

## API Endpoints

### Admin Stats
- `GET /api/admin/stats` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - List users with pagination and filtering
- `PATCH /api/admin/users` - Update user role

### Post Management
- `GET /api/admin/posts` - List posts with pagination and filtering
- `DELETE /api/admin/posts` - Soft or hard delete posts
- `PATCH /api/admin/posts` - Restore soft-deleted posts

### Comment Management
- `GET /api/admin/comments` - List comments with pagination and filtering
- `DELETE /api/admin/comments` - Soft or hard delete comments
- `PATCH /api/admin/comments` - Restore soft-deleted comments

## Access Control

### Admin Protection
- All admin routes are protected by the `requireAdmin()` middleware
- Redirects non-admin users to the home page
- Redirects unauthenticated users to sign-in

### Role Hierarchy
- **USER**: Standard user with basic permissions
- **ADMIN**: Full access to admin dashboard and moderation tools
- **BANNED**: Restricted access, cannot create content or interact

## UI Components

### Admin Layout
- Sidebar navigation with dashboard, users, posts, and comments sections
- Admin header with user info and back-to-site link
- Responsive design with mobile support

### Data Tables
- Pagination for large datasets
- Search and filtering capabilities
- Bulk actions and individual item actions
- Real-time status indicators

### Moderation Actions
- Confirmation dialogs for destructive actions
- Soft vs hard delete options with clear explanations
- Restore functionality for soft-deleted content

## Security Features

### Authentication
- NextAuth integration for secure admin sessions
- Role-based access control
- Session validation on all admin endpoints

### Audit Trail
- Track who deleted content and when
- Maintain deletion history for accountability
- Soft deletion preserves data for potential restoration

### Data Protection
- Soft deletion by default to prevent accidental data loss
- Hard deletion only for confirmed permanent removal
- Admin action logging for security auditing

## Usage Instructions

### Accessing Admin Dashboard
1. Sign in as an admin user
2. Click on the user avatar in the header
3. Select "Admin Dashboard" from the dropdown menu
4. Navigate to different sections using the sidebar

### Managing Users
1. Go to Admin Dashboard → Users
2. Use search to find specific users
3. Filter by role (USER, ADMIN, BANNED)
4. Click the actions menu (⋯) to change user roles
5. Confirm role changes in the dialog

### Moderating Posts
1. Go to Admin Dashboard → Posts
2. Search by title or tags
3. Toggle "Show deleted posts" to view soft-deleted content
4. Use the actions menu to soft delete, hard delete, or restore posts
5. Confirm actions in the confirmation dialog

### Moderating Comments
1. Go to Admin Dashboard → Comments
2. Search by content or user name
3. Toggle "Show deleted comments" to view soft-deleted content
4. Use the actions menu to soft delete, hard delete, or restore comments
5. View comment context by clicking on the post title

## Technical Implementation

### Middleware
- `src/lib/admin.ts` - Admin authorization utilities
- `requireAdmin()` - Server-side admin protection
- `isAdmin()` - Client-side admin checks

### Database Queries
- Filtered queries exclude deleted content for regular users
- Admin queries can include deleted content with `showDeleted` parameter
- Efficient pagination with proper indexing

### State Management
- React hooks for data fetching and state management
- Optimistic updates for better user experience
- Error handling with user-friendly messages

## Deployment Considerations

### Database Migration
Run the admin moderation migration:
```bash
bunx prisma db push
```

### Environment Variables
Ensure proper NextAuth configuration for admin role detection.

### Performance
- Database indexes on `isDeleted`, `role`, and timestamp fields
- Pagination to handle large datasets
- Efficient queries with proper includes and selects

## Future Enhancements

### Planned Features
- Bulk moderation actions
- Advanced filtering and sorting options
- Email notifications for moderation actions
- Detailed audit logs and reporting
- Content flagging system
- Automated moderation rules

### Analytics Improvements
- User engagement metrics
- Content performance analytics
- Moderation activity reports
- Platform health monitoring

## Troubleshooting

### Common Issues
1. **Admin access denied**: Verify user role is set to "ADMIN" in database
2. **Deleted content still visible**: Check if queries include `isDeleted: false` filter
3. **Permission errors**: Ensure proper session validation in API routes

### Debug Steps
1. Check user role in database
2. Verify session data in browser dev tools
3. Check server logs for authentication errors
4. Validate API endpoint responses 