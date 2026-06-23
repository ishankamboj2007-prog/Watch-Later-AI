# VideoVault AI - AI-Powered YouTube Video Library

An elegant, polished web application for managing your personal YouTube video library with intelligent AI features. Automatically categorize videos, generate summaries, perform semantic search, and receive periodic digest notifications.

## Features

**Core Functionality:**
- **User Authentication**: Secure Manus OAuth integration with protected dashboard access
- **Video Management**: Add YouTube videos via URL with automatic metadata extraction
- **AI-Powered Features**:
  - **Auto-Categorization**: LLM analyzes video content and assigns smart topic categories
  - **AI Summaries**: Generates concise summaries of video content automatically
  - **Semantic Search**: Natural language search that understands meaning, not just keywords
  - **Auto-Tagging**: Extracts relevant tags from video metadata

**User Experience:**
- **Elegant Dashboard**: Grid or list view with smooth transitions and responsive design
- **Category Management**: Create, customize, and organize video categories
- **Watch Status Tracking**: Mark videos as watched/unwatched
- **Video Details Page**: Full metadata, AI summary, and direct YouTube links
- **Settings Page**: Manage preferences and category configurations
- **Periodic Digests**: Owner receives weekly notifications of newly added videos

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL with Drizzle ORM
- **AI**: Manus built-in LLM API
- **Authentication**: Manus OAuth
- **Notifications**: Manus notification system

## Getting Started

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL database (provided by Manus platform)
- Manus OAuth credentials (automatically configured)

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment variables** (automatically injected by Manus):
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Session signing secret
   - `VITE_APP_ID`: OAuth application ID
   - `OAUTH_SERVER_URL`: OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL`: OAuth login portal
   - `BUILT_IN_FORGE_API_URL`: Manus LLM API endpoint
   - `BUILT_IN_FORGE_API_KEY`: LLM API key

3. **Start development server:**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```

## Project Structure

```
client/
  src/
    pages/
      Landing.tsx       # Public landing page with feature overview
      Dashboard.tsx     # Main video library with grid/list views
      VideoDetails.tsx  # Individual video details and metadata
      Settings.tsx      # User preferences and category management
    components/
      AddVideoModal.tsx # Modal for adding new videos
      DashboardLayout.tsx # Reusable dashboard layout
    lib/
      trpc.ts          # tRPC client configuration
    App.tsx            # Main routing and layout
    index.css          # Global styles and design system

server/
  routers.ts           # tRPC procedure definitions
  db.ts                # Database query helpers
  ai.ts                # LLM integration for categorization, summarization, search
  youtube.ts           # YouTube metadata extraction utilities
  digest.ts            # Periodic digest notification handler
  _core/
    index.ts           # Server startup and middleware
    context.ts         # tRPC context with auth
    oauth.ts           # OAuth callback handling
    llm.ts             # LLM API wrapper

drizzle/
  schema.ts            # Database schema definitions
  migrations/          # Generated SQL migrations

shared/
  const.ts             # Shared constants
```

## Database Schema

**Users**: Core authentication table
**Videos**: Stores YouTube videos with metadata and AI-generated content
**Categories**: User-defined video categories with custom colors
**VideoTags**: Additional metadata tags for videos
**UserPreferences**: User settings (view mode, etc.)
**DigestNotifications**: Tracks periodic digest notifications

## API Procedures (tRPC)

### Videos
- `videos.list()` - Get all user videos
- `videos.getById(id)` - Get specific video details
- `videos.add(youtubeUrl, description)` - Add new video (triggers AI processing)
- `videos.toggleWatched(id)` - Toggle watch status
- `videos.delete(id)` - Delete video
- `videos.search(query)` - Semantic search using LLM

### Categories
- `categories.list()` - Get all categories
- `categories.create(name, color)` - Create new category
- `categories.update(id, name, color)` - Update category
- `categories.delete(id)` - Delete category

### Settings
- `settings.getPreferences()` - Get user preferences
- `settings.updatePreferences(viewMode)` - Update preferences

### Auth
- `auth.me()` - Get current user
- `auth.logout()` - Logout user

## AI Features

### Video Categorization
When a video is added, the LLM analyzes its title and description to assign one of 14 predefined categories:
- Programming, Science, Business, Productivity, Design, Marketing, Finance, Education, Entertainment, Music, Sports, Health, Travel, Other

### Video Summarization
Each video receives an AI-generated summary based on its title, description, and channel information. Summaries are concise and capture the essence of the video content.

### Semantic Search
The search feature uses LLM understanding to find videos based on meaning rather than keyword matching. For example:
- "machine learning tutorials" finds videos about AI/ML
- "productivity tips" finds videos about time management, workflows, etc.
- "cooking recipes" finds cooking-related content

## Periodic Digest Notifications

The system automatically sends weekly digest notifications to the owner listing:
- All newly added videos since the last digest
- Videos grouped by category
- AI-generated summaries for each video
- Direct link to the video library

Digests are sent via the Manus notification system and can be customized in settings.

## Deployment

### Manus Platform (Recommended)

1. Click the **Publish** button in the Management UI
2. Choose your custom domain or use the auto-generated Manus domain
3. The application will be deployed automatically with:
   - SSL/TLS encryption
   - CDN distribution
   - Automatic backups
   - Scalable infrastructure

### Custom Deployment

For external hosting (Railway, Render, Vercel, etc.):

1. **Build the application:**
   ```bash
   pnpm build
   ```

2. **Set environment variables:**
   - All Manus platform env vars (see Local Development section)
   - `NODE_ENV=production`
   - `VITE_FRONTEND_URL=https://your-domain.com`

3. **Start the server:**
   ```bash
   pnpm start
   ```

**Note**: External hosting may have compatibility issues. Manus platform is recommended for optimal experience.

## Development Workflow

1. **Update database schema** in `drizzle/schema.ts`
2. **Generate migrations**: `pnpm drizzle-kit generate`
3. **Apply migrations** via `webdev_execute_sql` or manually
4. **Add query helpers** in `server/db.ts`
5. **Create tRPC procedures** in `server/routers.ts`
6. **Build UI** in `client/src/pages/` and `client/src/components/`
7. **Write tests** in `server/*.test.ts` using Vitest
8. **Run tests**: `pnpm test`

## Testing

Run the test suite:
```bash
pnpm test
```

Tests are written with Vitest and include:
- Authentication flow tests
- Database query tests
- tRPC procedure tests
- Frontend component tests

## Styling & Design

The application uses a refined, elegant design system:

**Colors**: Professional slate palette with blue accents
**Typography**: Inter font family with careful hierarchy
**Spacing**: Consistent 8px-based spacing system
**Components**: shadcn/ui components with custom styling
**Animations**: Smooth transitions and fade-in effects
**Responsiveness**: Mobile-first design with breakpoints at 640px, 1024px, 1280px

Customize colors and theme in `client/src/index.css`.

## Performance

- **Frontend**: Optimized React components with proper memoization
- **Backend**: Efficient database queries with proper indexing
- **AI**: Batched LLM requests for better throughput
- **Caching**: tRPC query caching with automatic invalidation
- **Images**: Optimized thumbnails from YouTube

## Security

- **Authentication**: Manus OAuth with secure session cookies
- **Authorization**: Protected procedures with user context
- **Database**: Parameterized queries prevent SQL injection
- **API**: Rate limiting on tRPC endpoints
- **Secrets**: All credentials stored securely in environment variables

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database credentials
- Ensure database server is running

### OAuth Errors
- Verify `VITE_APP_ID` and OAuth credentials
- Check redirect URLs match OAuth configuration
- Clear browser cookies and try again

### AI Features Not Working
- Verify `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL`
- Check LLM API rate limits
- Review error logs in browser console

### Digest Notifications Not Sending
- Verify `OWNER_OPEN_ID` is set correctly
- Check notification service is enabled
- Review server logs for digest scheduler errors

## Contributing

This is a personal project template. To extend it:

1. Add new features in separate branches
2. Write tests for new functionality
3. Update documentation
4. Create checkpoints before major changes

## License

MIT - Feel free to use this as a template for your own projects.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs: `.manus-logs/`
3. Check browser console for client-side errors
4. Contact Manus support for platform-specific issues

---

**Built with elegance and powered by AI** ✨
