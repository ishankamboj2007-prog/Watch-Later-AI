# YouTube Video Library AI - Architecture & Design

## Database Schema

### Core Tables

**users** (Manus OAuth managed)
- `id`: Primary key
- `openId`: Manus OAuth identifier
- `name`, `email`: User profile
- `role`: "user" | "admin"
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

**videos** (User's video library)
- `id`: Primary key
- `userId`: Foreign key to users
- `youtubeId`: YouTube video ID (extracted from URL)
- `title`: Video title
- `description`: Video description
- `channelName`: Channel name
- `channelUrl`: Channel URL
- `thumbnailUrl`: Video thumbnail URL
- `duration`: Video duration in seconds
- `youtubeUrl`: Full YouTube URL
- `watched`: Boolean flag (watched/unwatched status)
- `aiSummary`: AI-generated summary of video content
- `categoryId`: Foreign key to categories
- `createdAt`, `updatedAt`: Timestamps

**categories** (Video categories/topics)
- `id`: Primary key
- `userId`: Foreign key to users
- `name`: Category name (e.g., "Programming", "Science", "Business")
- `color`: Hex color for UI display (e.g., "#3B82F6")
- `description`: Optional category description
- `isDefault`: Boolean (true for system categories like "Uncategorized")
- `createdAt`, `updatedAt`: Timestamps

**videoTags** (Additional metadata tags)
- `id`: Primary key
- `videoId`: Foreign key to videos
- `tag`: Tag text (e.g., "python", "machine-learning")
- `createdAt`: Timestamp

**digestNotifications** (Tracking for periodic digests)
- `id`: Primary key
- `userId`: Foreign key to users
- `lastSentAt`: Timestamp of last digest
- `videosIncluded`: JSON array of video IDs included in last digest
- `updatedAt`: Timestamp

## API Procedures (tRPC)

### Video Management
- `videos.list`: Get all videos for user (with filtering/pagination)
- `videos.getById`: Get single video with full details
- `videos.add`: Add new video (triggers AI categorization and summarization)
- `videos.update`: Update video metadata
- `videos.delete`: Delete video from library
- `videos.toggleWatched`: Mark video as watched/unwatched
- `videos.search`: Semantic search using LLM understanding

### Category Management
- `categories.list`: Get all categories for user
- `categories.create`: Create custom category
- `categories.update`: Update category (name, color, description)
- `categories.delete`: Delete category
- `categories.getDefaults`: Get system default categories

### Settings
- `settings.getPreferences`: Get user preferences (view mode, etc.)
- `settings.updatePreferences`: Update user preferences
- `settings.getCategories`: Get all categories for settings UI

### Notifications (Owner-facing)
- `system.notifyOwner`: Send digest notification (internal use)

## AI Pipeline

### Video Categorization
When a video is added:
1. Extract title, description, and channel name
2. Call LLM with prompt: "Categorize this video into ONE of these topics: [list]. Video: [title] [description] Channel: [channel]"
3. Parse LLM response to extract category
4. Assign video to category (create if needed)

### Video Summarization
When a video is added:
1. Extract title, description, and channel name
2. Call LLM with prompt: "Write a concise 1-2 sentence summary of this video based on its metadata. Video: [title] [description] Channel: [channel]"
3. Store AI summary in database
4. Display on video detail page

### Semantic Search
When user searches:
1. Accept natural language query
2. Call LLM with prompt: "Given this search query: '[query]', which of these videos are relevant? Return video IDs. Videos: [list of user's videos with titles and descriptions]"
3. Return matching videos to user

## Design System

### Color Palette
- **Primary**: #3B82F6 (Blue) - Main actions and highlights
- **Secondary**: #8B5CF6 (Purple) - Secondary actions
- **Success**: #10B981 (Green) - Positive states
- **Warning**: #F59E0B (Amber) - Warnings
- **Danger**: #EF4444 (Red) - Destructive actions
- **Background**: #FFFFFF (Light mode) / #0F172A (Dark mode)
- **Surface**: #F8FAFC (Light) / #1E293B (Dark)
- **Text**: #1E293B (Light) / #F1F5F9 (Dark)
- **Border**: #E2E8F0 (Light) / #334155 (Dark)

### Typography
- **Font Family**: "Inter" (Google Fonts) - Clean, modern, professional
- **Headings**: Bold weight (700), sizes: h1 (32px), h2 (24px), h3 (20px), h4 (16px)
- **Body**: Regular weight (400), size 14px/16px
- **Small**: Regular weight (400), size 12px

### Spacing
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Component padding: 12-16px (buttons, inputs)
- Section gaps: 24-32px

### Components
- **Buttons**: Rounded corners (6px), smooth transitions, clear states
- **Cards**: Subtle shadows, rounded corners (8px), hover effects
- **Inputs**: Clean borders, focus states with blue outline
- **Badges**: Colored backgrounds matching categories
- **Modals**: Centered, with backdrop blur

## Page Structure

### Landing Page
- Hero section with feature overview
- Feature highlights (3-4 key benefits)
- CTA to sign in
- Footer with links

### Dashboard
- Header with user profile and settings icon
- Search bar with semantic search
- View toggle (grid/list)
- Category filter dropdown
- Video grid/list with:
  - Thumbnail
  - Title
  - Channel name
  - Category badge
  - Watch status indicator
  - Quick actions (watch toggle, delete)
- Empty state when no videos
- Loading skeletons

### Video Details Page
- Video header with thumbnail and metadata
- Title, channel, duration, upload date
- AI-generated summary section
- Category badge with edit option
- Tags section
- Watch status toggle
- Delete button
- Link to YouTube
- Related videos (same category)

### Settings Page
- User profile section
- View mode preference (grid/list)
- Category management:
  - List of all categories
  - Add new category button
  - Edit/delete category options
  - Color picker for categories
- Notification preferences

### Add Video Modal
- YouTube URL input field
- Loading state during processing
- Error handling for invalid URLs
- Success message with redirect to video details

## Data Flow

1. **User adds video:**
   - User enters YouTube URL
   - URL validation and YouTube ID extraction
   - Fetch video metadata via YouTube oEmbed
   - Call LLM for categorization
   - Call LLM for summarization
   - Save to database
   - Display success and redirect to video details

2. **User searches:**
   - User enters natural language query
   - Call LLM semantic search
   - Display matching videos
   - User can click to view details

3. **Periodic digest:**
   - Scheduled task runs daily/weekly
   - Query videos added since last digest
   - Format digest with categories
   - Send notification to owner
   - Update lastSentAt timestamp

## Security & Performance

- **Authentication**: Manus OAuth protects all endpoints
- **Authorization**: Users can only access their own videos
- **Rate limiting**: Implement LLM call throttling to prevent abuse
- **Caching**: Cache category lists and user preferences
- **Pagination**: Implement pagination for video lists (20 per page)
- **Error handling**: Graceful fallbacks for LLM failures

## Technology Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL with Drizzle migrations
- **AI**: Manus built-in LLM API
- **Authentication**: Manus OAuth
- **Notifications**: Manus notification API
- **Hosting**: Manus built-in deployment
