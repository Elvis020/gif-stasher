# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GIF Stash is a Next.js web application for organizing and managing Twitter/X GIFs. Users can save GIF links, organize them into folders, and view thumbnails.

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Start production server
```

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, TypeScript
- **Backend:** Supabase (PostgreSQL)
- **State Management:** TanStack React Query v5
- **Styling:** Tailwind CSS 4 with CSS variables
- **UI:** Custom components in `app/components/custom-ui/`, Shadcn/ui dropdown

## Architecture

### Data Flow
1. Supabase client initialized in `lib/supabase.ts`
2. React Query hooks in `app/hooks/useSupabase.ts` handle all CRUD operations
3. Components consume hooks for data fetching and mutations
4. Server actions in `app/actions.ts` handle Twitter/X URL validation and video extraction

### Video Storage Flow
1. User pastes tweet URL → validates via OEmbed API
2. Creates link record with `video_status: 'pending'`
3. Attempts video extraction via Twitter Syndication API
4. Downloads video server-side and uploads to Supabase Storage
5. Updates link with `video_url` (public storage URL)
6. If extraction fails, prompts user for manual video URL input

### Database Schema
- **folders:** id, name, created_at
- **links:** id, url, folder_id, thumbnail, created_at, video_url, video_path, video_size, video_status, video_error, original_video_url

### Supabase Storage
- Bucket: `ideos` (public)
- Files stored as: `videos/{timestamp}-{random}.mp4`

### Key Files
- `app/page.tsx` - Main page component with folder/link management
- `app/hooks/useSupabase.ts` - All data hooks (useFolders, useLinks, useCreateLink, useProcessVideo, useRetryVideo, etc.)
- `app/actions.ts` - Server actions for Twitter validation, video extraction (Syndication API), download/upload to storage
- `lib/supabase.ts` - Supabase client initialization
- `types/index.ts` - TypeScript interfaces (Folder, Link, VideoStatus)

### Component Structure
- `AddLinkForm` - Form for adding Twitter/X GIF links with validation and video processing
- `FolderModal` - Create/edit folder modal
- `FolderTabs` - Folder navigation
- `LinkCard` - Link display with video preview on hover, copy URL, retry failed uploads
- `LinkGrid` - Grid layout for links

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # Server-side only, for storage uploads
API_SECRET=
```

## Code Patterns

- Path alias `@/*` maps to project root
- Use `cn()` from `lib/utils.ts` for Tailwind class merging
- React Query mutations invalidate queries on success for automatic UI updates
- Server actions (use server) for server-side API calls
