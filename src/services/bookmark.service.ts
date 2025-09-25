import { Injectable, signal, inject } from '@angular/core';
import { Bookmark } from '../models/bookmark.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private storageService = inject(StorageService);
  bookmarks = signal<Bookmark[]>([]);

  constructor() {
    const data = this.storageService.getData();
    this.bookmarks.set(data.bookmarks ?? []);
  }

  setInitialData(bookmarks: Bookmark[]): void {
    this.bookmarks.set(bookmarks);
    this.storageService.saveData();
  }

  addBookmark(title: string, url: string, folderId: string | null = null): void {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title,
      url: this.ensureHttp(url),
      createdAt: Date.now(),
      folderId,
    };
    this.bookmarks.update(bookmarks => [newBookmark, ...bookmarks]);
    this.storageService.saveData();
  }

  updateBookmark(updatedBookmark: Bookmark): void {
    updatedBookmark.url = this.ensureHttp(updatedBookmark.url);
    this.bookmarks.update(bookmarks =>
      bookmarks.map(b => (b.id === updatedBookmark.id ? updatedBookmark : b))
    );
    this.storageService.saveData();
  }

  deleteBookmark(id: string): void {
    this.bookmarks.update(bookmarks => bookmarks.filter(b => b.id !== id));
    this.storageService.saveData();
  }

  deleteBookmarks(ids: string[]): void {
    const idSet = new Set(ids);
    this.bookmarks.update(bookmarks => bookmarks.filter(b => !idSet.has(b.id)));
    this.storageService.saveData();
  }

  moveBookmarks(ids: string[], folderId: string | null): void {
    const idSet = new Set(ids);
    this.bookmarks.update(bookmarks =>
      bookmarks.map(b => (idSet.has(b.id) ? { ...b, folderId } : b))
    );
    this.storageService.saveData();
  }
  
  importBookmarks(newBookmarks: Bookmark[]): void {
    const currentBookmarks = this.bookmarks();
    const bookmarkMap = new Map(currentBookmarks.map(b => [b.id, b]));

    for (const newBookmark of newBookmarks) {
      if (newBookmark && newBookmark.id) {
          const bookmarkWithFolder = { ...newBookmark, folderId: newBookmark.folderId || null };
          bookmarkMap.set(newBookmark.id, bookmarkWithFolder);
      }
    }
    
    const mergedBookmarks = Array.from(bookmarkMap.values())
      .sort((a: Bookmark, b: Bookmark) => b.createdAt - a.createdAt);

    this.bookmarks.set(mergedBookmarks);
    this.storageService.saveData();
  }

  private ensureHttp(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
  }
}
