export interface Folder {
  id: string;
  name: string;
  created_at: string;
  user_id?: string | null;
}

export type VideoStatus = 'pending' | 'downloading' | 'uploaded' | 'failed';

export interface Link {
  id: string;
  url: string;
  folder_id: string | null;
  thumbnail?: string;
  created_at: string;
  user_id?: string | null;
  title?: string | null;
  // Video storage fields
  video_url?: string | null;
  video_path?: string | null;
  video_size?: number | null;
  video_status?: VideoStatus | null;
  video_error?: string | null;
  original_video_url?: string | null;
}

export interface LinkWithFolder extends Link {
  folder?: Folder | null;
}
