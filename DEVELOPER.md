# Developer Documentation

> Technical documentation for contributing to and developing GIF Stash

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API & Server Actions](#api--server-actions)
- [Security Implementation](#security-implementation)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

GIF Stash follows a modern Next.js App Router architecture with server-side rendering and client-side interactivity:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Next.js App Router        │
│  ┌─────────────────────┐    │
│  │ Client Components   │    │
│  │  - React Query      │    │
│  │  - Framer Motion    │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ Server Actions      │    │
│  │  - Video Processing │    │
│  │  - Rate Limiting    │    │
│  │  - Audit Logging    │    │
│  └─────────────────────┘    │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│        Supabase              │
│  ┌──────────────────────┐    │
│  │  PostgreSQL (RLS)    │    │
│  │  - links table       │    │
│  │  - folders table     │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  Storage (Videos)    │    │
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  Auth (Anonymous +   │    │
│  │       Google OAuth)  │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Twitter Syndication API    │
│   (Video Extraction)         │
└──────────────────────────────┘
```

## 📁 Project Structure

```
gif-stash/
├── app/
│   ├── actions.ts                    # Server actions
│   │   ├── validateTwitterGif()      # URL validation
│   │   ├── extractVideoFromTweet()   # Syndication API call
│   │   ├── downloadAndUploadVideo()  # Video processing
│   │   ├── migrateAnonymousData()    # Data migration
│   │   └── cleanupInactiveAnonymousUsers()
│   │
│   ├── components/
│   │   ├── AddLinkForm.tsx           # Link creation form
│   │   ├── FolderDrawer.tsx          # Folder navigation
│   │   ├── FolderModal.tsx           # Folder CRUD modal
│   │   ├── Header.tsx                # App header
│   │   ├── LinkCard.tsx              # GIF display card
│   │   ├── LinkGrid.tsx              # Grid layout
│   │   ├── SignInBanner.tsx          # Anonymous user prompt
│   │   ├── ThemeToggle.tsx           # Theme switcher
│   │   ├── UndoToast.tsx             # Undo delete UI
│   │   ├── UserMenu.tsx              # Auth dropdown
│   │   └── ui/                       # Shadcn components
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication logic
│   │   ├── useSupabase.ts            # Data fetching (React Query)
│   │   ├── useTheme.ts               # Theme management
│   │   └── useUndoDelete.ts          # Undo delete logic
│   │
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main page
│
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── rate-limit.ts                 # In-memory rate limiter
│   ├── audit-log.ts                  # Audit logging
│   └── utils.ts                      # Utility functions
│
├── providers/
│   └── query-provider.tsx            # React Query setup
│
├── supabase/
│   └── migrations/                   # SQL migrations
│       └── add_title_column.sql
│
├── types/
│   └── index.ts                      # TypeScript types
│
└── public/
    └── gif_stash.png                 # App icon
```

## 🔧 Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Animations
- **TanStack React Query v5**: Data fetching & caching
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **clsx**: Conditional class names

### Backend
- **Supabase**: BaaS platform
  - PostgreSQL with Row Level Security (RLS)
  - Storage for video files
  - Authentication (Anonymous + OAuth)
- **Server Actions**: Next.js server-side functions

### APIs
- **Twitter OEmbed API**: URL validation
- **Twitter Syndication API**: Video extraction

## 🚀 Getting Started

### Prerequisites

```bash
node -v    # v18.0.0 or higher
npm -v     # v9.0.0 or higher
```

### Environment Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Elvis020/gif-stasher.git
   cd gif-stasher
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   API_SECRET=random-secret-string
   ```

3. **Set up Supabase**

   - Create tables (run migrations in SQL Editor)
   - Enable Anonymous Authentication
   - Configure Google OAuth (see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md))
   - Create `Videos` storage bucket (public)

4. **Run development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Tables

#### `folders`
```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);
```

#### `links`
```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  thumbnail TEXT,
  video_url TEXT,
  video_path TEXT,
  video_size INTEGER,
  video_status TEXT DEFAULT 'pending',
  video_error TEXT,
  original_video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (similar to folders)
```

### Storage Buckets

**Videos** (public bucket)
- Path format: `{random-id}.mp4`
- Max file size: 15MB
- Content type: `video/mp4`

## 🔌 API & Server Actions

### Video Processing Flow

```typescript
// 1. User submits Twitter URL
validateTwitterGif(url)
  ↓
// 2. Extract video from tweet
extractVideoFromTweet(tweetUrl)
  ↓
// 3. Download and upload to storage
downloadAndUploadVideo(videoUrl, linkId, thumbnail, title, userId)
  ↓
// 4. Update link record with video URL
```

### Key Server Actions

#### `validateTwitterGif(url: string)`
- Validates URL hostname against whitelist
- Checks tweet existence via OEmbed API
- Scrapes thumbnail from og:image

#### `extractVideoFromTweet(tweetUrl: string)`
- Extracts tweet ID from URL
- Calls Syndication API
- Validates video duration (max 10s)
- Extracts alt text as title
- Returns highest bitrate MP4 variant

#### `downloadAndUploadVideo(videoSourceUrl, linkId, thumbnail?, title?, userId?)`
- Rate limiting check (10 per 10 min)
- SSRF protection (whitelist Twitter CDN)
- Downloads video via fetch
- Validates content type & size (max 15MB)
- Uploads to Supabase Storage
- Updates link record

#### `migrateAnonymousData(fromUserId, toUserId)`
- Transfers links and folders
- Uses service role to bypass RLS
- Logs audit event

## 🔒 Security Implementation

### 1. SSRF Protection

```typescript
// lib/actions.ts
function isValidVideoUrl(url: string): { valid: boolean; error?: string } {
  // Only HTTPS
  if (parsedUrl.protocol !== 'https:') return { valid: false };

  // Whitelist Twitter CDN
  const allowedDomains = ['video.twimg.com', 'pbs.twimg.com'];

  // Block private IPs
  const blockedPatterns = [/^127\./, /^10\./, /^192\.168\./];
}
```

### 2. Rate Limiting

```typescript
// lib/rate-limit.ts
export const RATE_LIMITS = {
  CREATE_LINK: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  PROCESS_VIDEO: { maxRequests: 10, windowMs: 10 * 60 * 1000 },
  DELETE_LINK: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
};
```

### 3. Authorization

```typescript
// Ownership verification before deletion
const { data: link } = await supabase
  .from("links")
  .select("user_id, video_path")
  .eq("id", linkId)
  .single();

if (link.user_id !== userId) {
  logSecurityViolation(userId, 'Unauthorized deletion attempt');
  return false;
}
```

### 4. Audit Logging

```typescript
// lib/audit-log.ts
export type AuditEventType =
  | 'AUTH_SIGN_IN'
  | 'DATA_MIGRATION'
  | 'VIDEO_UPLOAD'
  | 'SECURITY_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED';

logAuditEvent('VIDEO_UPLOAD', userId, { linkId, videoSize });
```

## 📝 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Prefer server components when possible
- Keep client components minimal

### Component Patterns

```typescript
// Client Component
"use client";

import { useState } from "react";
import { useTheme } from "@/app/hooks/useTheme";

export function MyComponent() {
  const { isDark } = useTheme();
  // ...
}

// Server Action
"use server";

export async function myServerAction(data: FormData) {
  // Server-side logic
}
```

### React Query Patterns

```typescript
// Query
export function useLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data } = await supabase.from("links").select("*");
      return data as Link[];
    },
  });
}

// Mutation with optimistic updates
export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: Link) => {
      // Delete logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Anonymous user can create links
- [ ] Anonymous user can sign in with Google
- [ ] Data migrates correctly on sign-in
- [ ] Folders can be created, renamed, deleted
- [ ] Links can be moved between folders
- [ ] Video auto-play works on hover/mobile
- [ ] Undo delete works correctly
- [ ] Rate limiting triggers correctly
- [ ] Theme toggle persists
- [ ] Mobile responsiveness

### Future: Automated Testing

```bash
# Unit tests (future)
npm run test

# E2E tests (future)
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**

```bash
# Or deploy via CLI
vercel --prod
```

### Environment Variables for Production

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `API_SECRET`

### Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase RLS policies enabled
- [ ] Storage bucket is public
- [ ] Database migrations run
- [ ] Anonymous auth enabled

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Videos not uploading**
- Check Supabase storage bucket permissions (should be public)
- Verify service role key is correct
- Check network logs for CORS issues

**OAuth redirect errors**
- Verify redirect URIs in Google Cloud Console
- Check Supabase Auth settings
- Ensure "Enable manual linking" is enabled

**Rate limit not working**
- In-memory rate limiter resets on server restart
- For production, use Redis (Upstash, Vercel KV)

**Videos not auto-playing on mobile**
- Check `autoPlayOnMobile` prop is passed correctly
- Verify mobile detection logic
- Some browsers block autoplay with sound (videos are muted)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
6. Push and create a Pull Request

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

**Questions?** Open an issue or contact [@Elvis020](https://github.com/Elvis020)
