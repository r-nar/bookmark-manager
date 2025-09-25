import { Injectable, signal, inject } from '@angular/core';
import { Group } from '../models/group.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private storageService = inject(StorageService);
  groups = signal<Group[]>([]);
  
  constructor() {
    const data = this.storageService.getData();
    this.groups.set(data.groups ?? []);
  }

  // FIX: Add setInitialData method to allow populating groups from an external source.
  setInitialData(groups: Group[]): void {
    this.groups.set(groups);
    this.storageService.saveData();
  }

  addGroup(name: string, emails: string[]): void {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      emails,
    };
    this.groups.update(groups => [newGroup, ...groups]);
    this.storageService.saveData();
  }

  updateGroup(updatedGroup: Group): void {
    this.groups.update(groups =>
      groups.map(g => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    this.storageService.saveData();
  }

  deleteGroup(id: string): void {
    this.groups.update(groups => groups.filter(g => g.id !== id));
    this.storageService.saveData();
  }
}