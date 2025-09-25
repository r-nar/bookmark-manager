import { Injectable, signal, inject } from '@angular/core';
import { Folder } from '../models/folder.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private storageService = inject(StorageService);
  folders = signal<Folder[]>([]);
  
  constructor() {
    const data = this.storageService.getData();
    this.folders.set(data.folders ?? []);
  }

  setInitialData(folders: Folder[]): void {
    this.folders.set(folders);
    this.storageService.saveData();
  }

  addFolder(name: string, parentId: string | null = null): void {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: Date.now(),
    };
    this.folders.update(folders => [...folders, newFolder].sort((a,b) => a.name.localeCompare(b.name)));
    this.storageService.saveData();
  }

  updateFolder(updatedFolder: Folder): void {
    this.folders.update(folders =>
      folders.map(f => (f.id === updatedFolder.id ? updatedFolder : f))
    );
    this.storageService.saveData();
  }

  deleteFolder(id: string): void {
    // In a real app, you'd need to decide what to do with bookmarks in a deleted folder.
    // For now, we just delete the folder.
    this.folders.update(folders => folders.filter(f => f.id !== id));
    this.storageService.saveData();
  }
}
