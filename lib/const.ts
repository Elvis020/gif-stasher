import { Folder, Link } from "@/types";

export const MOCK_FOLDERS: Folder[] = [
  { id: "1", name: "Reactions", created_at: "2024-01-01" },
  { id: "2", name: "Wholesome", created_at: "2024-01-01" },
  { id: "3", name: "Chaos", created_at: "2024-01-01" },
];

export const MOCK_LINKS: Link[] = [
  {
    id: "1",
    url: "https://x.com/user/status/1234567890",
    folder_id: "1",
    created_at: "2024-01-01",
  },
  {
    id: "2",
    url: "https://x.com/user/status/2345678901",
    folder_id: "1",
    created_at: "2024-01-01",
  },
  {
    id: "3",
    url: "https://x.com/user/status/3456789012",
    folder_id: "2",
    created_at: "2024-01-01",
  },
  {
    id: "4",
    url: "https://x.com/user/status/4567890123",
    folder_id: "3",
    created_at: "2024-01-01",
  },
  {
    id: "5",
    url: "https://x.com/user/status/5678901234",
    folder_id: null,
    created_at: "2024-01-01",
  },
  {
    id: "6",
    url: "https://x.com/user/status/6789012345",
    folder_id: "1",
    created_at: "2024-01-01",
  },
];
