export interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export interface Link {
  id: string;
  url: string;
  folder_id: string | null;
  created_at: string;
}

export interface LinkWithFolder extends Link {
  folder?: Folder | null;
}
