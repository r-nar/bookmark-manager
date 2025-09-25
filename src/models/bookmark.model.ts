

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  folderId: string | null;
}