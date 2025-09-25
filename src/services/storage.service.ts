import { Injectable, inject, Injector } from '@angular/core';
import { Bookmark } from '../models/bookmark.model';
import { Group } from '../models/group.model';
import { Folder } from '../models/folder.model';
import { BookmarkService } from './bookmark.service';
import { GroupService } from './group.service';
import { FolderService } from './folder.service';

interface AppData {
  bookmarks: Bookmark[];
  groups: Group[];
  folders: Folder[];
}

const STORAGE_KEY = 'secure-bookmark-manager-data';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private injector = inject(Injector);

  // Lazily inject services to avoid circular dependencies
  private _bookmarkService: BookmarkService | undefined;
  private get bookmarkService(): BookmarkService {
    if (!this._bookmarkService) this._bookmarkService = this.injector.get(BookmarkService);
    return this._bookmarkService;
  }

  private _groupService: GroupService | undefined;
  private get groupService(): GroupService {
    if (!this._groupService) this._groupService = this.injector.get(GroupService);
    return this._groupService;
  }
  
  private _folderService: FolderService | undefined;
  private get folderService(): FolderService {
    if (!this._folderService) this._folderService = this.injector.get(FolderService);
    return this._folderService;
  }

  getData(): AppData {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        return {
          bookmarks: Array.isArray(parsedData.bookmarks) ? parsedData.bookmarks : [],
          groups: Array.isArray(parsedData.groups) ? parsedData.groups : [],
          folders: Array.isArray(parsedData.folders) ? parsedData.folders : [],
        };
      } catch (e) {
        console.error('Error parsing data from localStorage', e);
        return { bookmarks: [], groups: [], folders: [] };
      }
    }
    return { bookmarks: [], groups: [], folders: [] };
  }

  saveData(): void {
    const data: AppData = {
        bookmarks: this.bookmarkService.bookmarks(),
        groups: this.groupService.groups(),
        folders: this.folderService.folders()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }
}