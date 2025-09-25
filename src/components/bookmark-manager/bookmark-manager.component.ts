import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { BookmarkService } from '../../services/bookmark.service';
import { Bookmark } from '../../models/bookmark.model';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { FolderService } from '../../services/folder.service';
import { Folder } from '../../models/folder.model';

@Component({
  selector: 'app-bookmark-manager',
  standalone: true,
  template: `
<div class="w-full max-w-4xl flex flex-col bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
  @if (selectedBookmarks().size > 0) {
    <!-- Bulk Action Header -->
    <header class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-blue-900/30 shrink-0 h-[89px]">
      <div class="flex items-center space-x-4">
        <button (click)="clearSelection()" title="Clear selection" class="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <span class="text-lg font-semibold text-slate-100">{{ selectedBookmarks().size }} selected</span>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-4">
        <button (click)="openMoveModal()" title="Move Selected" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-100 bg-slate-700 rounded-md hover:bg-slate-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <span>Move</span>
        </button>
        <button (click)="handleDeleteSelected()" title="Delete Selected" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          <span>Delete</span>
        </button>
      </div>
    </header>
  } @else {
    <!-- Standard Header -->
    <header class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-slate-800/50 shrink-0">
      <div class="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h1 class="text-2xl font-bold text-slate-100">My Bookmarks</h1>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- View Switcher -->
        <div class="flex items-center p-1 bg-slate-700/50 rounded-lg">
          <button (click)="setViewMode('list')" title="List View" 
                  class="p-2 rounded-md transition"
                  [class.bg-slate-600]="viewMode() === 'list'"
                  [class.text-white]="viewMode() === 'list'"
                  [class.text-slate-400]="viewMode() !== 'list'"
                  [class.hover:text-white]="viewMode() !== 'list'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button (click)="setViewMode('folder')" title="Folder View"
                  class="p-2 rounded-md transition"
                  [class.bg-slate-600]="viewMode() === 'folder'"
                  [class.text-white]="viewMode() === 'folder'"
                  [class.text-slate-400]="viewMode() !== 'folder'"
                  [class.hover:text-white]="viewMode() !== 'folder'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        </div>
        
        <!-- Add Dropdown -->
        <div class="relative">
          <button (click)="toggleAddMenu()" class="flex items-center justify-center w-10 h-10 bg-cyan-600 rounded-full hover:bg-cyan-700 text-white transition-all duration-300 transform hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          @if (showAddMenu()) {
            <div class="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg z-30 border border-slate-600">
              <a (click)="openAddBookmark()" class="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer rounded-t-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                <span>Add Bookmark</span>
              </a>
              <a (click)="openAddFolder()" class="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  <span>Add Folder</span>
              </a>
              <a (click)="openManageGroups()" class="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer rounded-b-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span>Manage Groups</span>
              </a>
            </div>
          }
        </div>

        <button (click)="toggleImportModal()" title="Import Bookmarks" class="flex items-center justify-center w-10 h-10 bg-slate-700 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        
        <!-- Export Dropdown -->
        <div class="relative">
          <button (click)="toggleExportMenu()" title="Export Bookmarks" class="flex items-center justify-center w-10 h-10 bg-slate-700 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          @if (showExportMenu()) {
            <div class="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg z-30 border border-slate-600">
              <a (click)="handleExport('json')" class="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer rounded-t-md">
                <span class="font-mono text-xs bg-slate-500 text-white rounded px-1 mr-3">JSON</span>
                <span>Export as JSON</span>
              </a>
              <a (click)="handleExport('html')" class="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 cursor-pointer rounded-b-md">
                <span class="font-mono text-xs bg-slate-500 text-white rounded px-1 mr-3">HTML</span>
                <span>Export as HTML</span>
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  }

  <main class="p-4 sm:p-6 overflow-y-auto">
    @if (showForm()) {
      <div class="bg-slate-900/50 p-6 rounded-lg mb-6 border border-slate-700">
        <h2 class="text-xl font-semibold mb-4">{{ editingBookmark() ? 'Edit Bookmark' : 'Add New Bookmark' }}</h2>
        <form (submit)="handleSubmit($event)" class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input type="text" id="title" [value]="newTitle()" (input)="onTitleInput($event)" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. Angular Docs">
          </div>
          <div>
            <label for="url" class="block text-sm font-medium text-slate-400 mb-1">URL</label>
            <input type="text" id="url" [value]="newUrl()" (input)="onUrlInput($event)" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. https://angular.dev">
          </div>
          <div class="flex justify-end space-x-3 pt-2">
            <button type="button" (click)="toggleForm()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" [disabled]="!isFormValid()" class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition">
              {{ editingBookmark() ? 'Save Changes' : 'Add Bookmark' }}
            </button>
          </div>
        </form>
      </div>
    }

    @if (paginatedBookmarks().length > 0 && !showForm()) {
      <div class="flex items-center justify-between mb-4 px-1 text-sm">
        <div class="flex items-center">
          <div (click)="toggleSelectAllOnPage()" class="h-5 w-5 rounded flex items-center justify-center cursor-pointer shrink-0 transition-all"
               [class.bg-violet-600]="areAllOnPageSelected()"
               [class.border-slate-500]="!areAllOnPageSelected()"
               [class.border]="!areAllOnPageSelected()"
               [class.bg-slate-700]="!areAllOnPageSelected()"
               [class.hover:bg-slate-600]="!areAllOnPageSelected()">
            @if(areAllOnPageSelected()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            }
          </div>
          <label (click)="toggleSelectAllOnPage()" class="ml-2 text-slate-400 cursor-pointer">Select All on Page</label>

          @if (showSelectAllMessage()) {
            <span class="mx-3 text-slate-600">|</span>
            <span class="text-slate-300">All {{ paginatedBookmarks().length }} on this page selected.</span>
            <button (click)="selectAllBookmarks()" class="ml-2 text-cyan-400 hover:text-cyan-300 font-semibold transition">
              Select all {{ bookmarks().length }} bookmarks
            </button>
          }
        </div>
      </div>
    }

    @if (paginatedBookmarks().length > 0) {
      @switch (viewMode()) {
        @case ('list') {
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-300">
              <thead class="text-xs text-slate-400 uppercase bg-slate-700/50">
                <tr>
                  <th scope="col" class="p-4 w-4"></th>
                  <th scope="col" class="px-6 py-3">Bookmark</th>
                  <th scope="col" class="px-6 py-3">Folder</th>
                  <th scope="col" class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for(bookmark of paginatedBookmarks(); track bookmark.id) {
                  <tr class="border-b border-slate-700 hover:bg-slate-700/50" [class.bg-blue-900/20]="selectedBookmarks().has(bookmark.id)">
                    <td class="p-4 w-4">
                      <div (click)="toggleBookmarkSelection(bookmark.id)" class="h-5 w-5 rounded flex items-center justify-center cursor-pointer" [class.bg-violet-600]="selectedBookmarks().has(bookmark.id)" [class.border-slate-500]="!selectedBookmarks().has(bookmark.id)" [class.border]="!selectedBookmarks().has(bookmark.id)" [class.bg-slate-700]="!selectedBookmarks().has(bookmark.id)">
                         @if(selectedBookmarks().has(bookmark.id)) {
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                         }
                      </div>
                    </td>
                    <th scope="row" class="px-6 py-4 font-medium text-slate-100 whitespace-nowrap">
                      <a [href]="bookmark.url" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-3 group">
                        <img [src]="getFaviconUrl(bookmark.url)" alt="favicon" class="w-6 h-6 rounded-sm object-cover bg-slate-600 p-0.5 shrink-0">
                        <div class="flex-1 min-w-0">
                          <div class="truncate group-hover:text-cyan-400">{{ bookmark.title }}</div>
                          <div class="text-xs text-slate-400 truncate">{{ bookmark.url }}</div>
                        </div>
                      </a>
                    </th>
                    <td class="px-6 py-4">{{ folderNameMap().get(bookmark.folderId!) || 'Uncategorized' }}</td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="handleEdit(bookmark)" title="Edit" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                      </button>
                      <button (click)="handleDelete(bookmark.id)" title="Delete" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-red-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @case ('folder') {
          @for(group of groupedBookmarks(); track group.folderId) {
            <div class="mb-8" (dragover)="onDragOver($event)" (drop)="onDrop($event, group.folderId)">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">{{ group.folderName }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (bookmark of group.bookmarks; track bookmark.id) {
                  <div class="group bg-slate-700/50 rounded-lg p-4 flex flex-col justify-between border transition-all duration-300"
                       [class.border-blue-500]="selectedBookmarks().has(bookmark.id)"
                       [class.shadow-lg]="selectedBookmarks().has(bookmark.id)"
                       [class.shadow-blue-500/20]="selectedBookmarks().has(bookmark.id)"
                       [class.border-transparent]="!selectedBookmarks().has(bookmark.id)"
                       draggable="true" 
                       (dragstart)="onDragStart($event, bookmark.id)">
                    
                    <div class="flex-grow flex items-start space-x-4">
                      <div (click)="toggleBookmarkSelection(bookmark.id)" class="mt-1 h-5 w-5 rounded flex items-center justify-center cursor-pointer shrink-0 transition-colors" [class.bg-violet-600]="selectedBookmarks().has(bookmark.id)" [class.border-slate-500]="!selectedBookmarks().has(bookmark.id)" [class.border]="!selectedBookmarks().has(bookmark.id)" [class.bg-slate-700]="!selectedBookmarks().has(bookmark.id)" [class.hover:bg-slate-600]="!selectedBookmarks().has(bookmark.id)">
                          @if(selectedBookmarks().has(bookmark.id)) {
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                      </div>

                      <a [href]="bookmark.url" target="_blank" rel="noopener noreferrer" class="flex items-start space-x-3 group-hover:text-cyan-400 transition-colors flex-grow min-w-0">
                        <img [src]="getFaviconUrl(bookmark.url)" alt="favicon" class="w-8 h-8 rounded-sm object-cover bg-slate-600 p-1 shrink-0">
                        <div class="flex-1 min-w-0">
                          <h3 class="font-semibold text-slate-100 truncate">{{ bookmark.title }}</h3>
                          <p class="text-sm text-slate-400 truncate">{{ bookmark.url }}</p>
                        </div>
                      </a>
                    </div>

                    <div class="flex items-center justify-end space-x-1 mt-2 -mb-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button (click)="handleEdit(bookmark)" title="Edit" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                      </button>
                      <button (click)="handleDelete(bookmark.id)" title="Delete" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-red-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      }
    } @else {
      <div class="text-center py-20 px-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-slate-300">No Bookmarks Yet</h2>
        <p class="mt-1 text-slate-400">Click the '+' button to add your first bookmark.</p>
      </div>
    }
  </main>

  @if (totalPages() > 1) {
    <footer class="flex items-center justify-center p-4 border-t border-slate-700 shrink-0 space-x-2">
      <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 transition">Previous</button>
      @for (page of pages(); track page) {
        <button (click)="goToPage(page)" class="px-3 py-1 text-sm rounded-md transition" [class.bg-blue-500]="currentPage() === page" [class.text-white]="currentPage() === page" [class.bg-slate-700]="currentPage() !== page" [class.hover:bg-slate-600]="currentPage() !== page">{{ page }}</button>
      }
      <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="px-3 py-1 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 transition">Next</button>
    </footer>
  }
</div>

<!-- Group Manager Modal -->
@if (showGroupManager()) {
<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-lg border border-slate-700 flex flex-col max-h-[90vh]">
    <header class="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
      <h2 class="text-xl font-bold text-slate-100">Manage Groups</h2>
      <button (click)="toggleGroupManager()" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <div class="flex-grow p-6 overflow-y-auto space-y-6">
      <div class="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
        <h3 class="text-lg font-semibold mb-4">{{ editingGroup() ? 'Edit Group' : 'Add New Group' }}</h3>
        <form (submit)="handleGroupSubmit($event)" class="space-y-4">
          <div>
            <label for="group-name" class="block text-sm font-medium text-slate-400 mb-1">Group Name</label>
            <input type="text" id="group-name" [value]="groupName()" (input)="onGroupNameInput($event)" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. Work Colleagues">
          </div>
          <div>
            <label for="group-emails" class="block text-sm font-medium text-slate-400 mb-1">Emails (comma-separated)</label>
            <textarea id="group-emails" rows="3" [value]="groupEmails()" (input)="onGroupEmailsInput($event)" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. friend1@example.com, friend2@example.com"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-2">
            @if (editingGroup()) {
              <button type="button" (click)="resetGroupForm()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel Edit</button>
            }
            <button type="submit" [disabled]="!isGroupFormValid()" class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition">
              {{ editingGroup() ? 'Save Changes' : 'Add Group' }}
            </button>
          </div>
        </form>
      </div>

      @if (groups().length > 0) {
        <div class="space-y-3">
            @for (group of groups(); track group.id) {
            <div class="bg-slate-700/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-600 gap-4">
                <div class="flex-grow">
                    <h4 class="font-semibold text-slate-200">{{ group.name }}</h4>
                    <p class="text-sm text-slate-400 truncate max-w-sm">{{ group.emails.join(', ') }}</p>
                </div>
                <div class="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button (click)="handleGroupEdit(group)" title="Edit Group" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                    </button>
                    <button (click)="handleGroupDelete(group.id)" title="Delete Group" class="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-red-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            }
        </div>
      } @else {
        <div class="text-center py-10 px-6 border-2 border-dashed border-slate-700 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-semibold text-slate-300">No Groups Created</h3>
          <p class="mt-1 text-slate-400">Create a group to easily share bookmarks.</p>
        </div>
      }
    </div>
  </div>
</div>
}

<!-- Add Folder Modal -->
@if (showFolderModal()) {
<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <form (submit)="handleFolderSubmit($event)" class="w-full max-w-md bg-slate-800 rounded-2xl shadow-lg border border-slate-700">
    <header class="flex items-center justify-between p-4 border-b border-slate-700">
      <h2 class="text-xl font-bold text-slate-100">Add New Folder</h2>
      <button type="button" (click)="toggleFolderModal()" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
    <div class="p-6 space-y-4">
        <div>
            <label for="folder-name" class="block text-sm font-medium text-slate-400 mb-1">Folder Name</label>
            <input type="text" id="folder-name" [value]="newFolderName()" (input)="onFolderNameInput($event)" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. Work Projects">
        </div>
    </div>
    <footer class="flex justify-end space-x-3 p-4 border-t border-slate-700">
      <button type="button" (click)="toggleFolderModal()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel</button>
      <button type="submit" [disabled]="!isFolderFormValid()" class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition">Add Folder</button>
    </footer>
  </form>
</div>
}

<!-- Import Bookmarks Modal -->
@if (showImportModal()) {
<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-lg border border-slate-700 flex flex-col max-h-[90vh]">
    <header class="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
      <h2 class="text-xl font-bold text-slate-100">Import Bookmarks</h2>
      <button (click)="toggleImportModal()" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
    <div class="flex-grow p-6 overflow-y-auto space-y-4">
      <p class="text-sm text-slate-400">Select a JSON or HTML bookmark file to import. Bookmarks with existing IDs will be updated, and new ones will be added.</p>
      
      <div>
        <label for="file-upload" class="sr-only">Choose file</label>
        <input type="file" (change)="handleFileSelect($event)" accept=".json,.html,.htm" id="file-upload" class="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/20 file:text-cyan-300 hover:file:bg-cyan-600/30">
      </div>

      @if (importError()) {
        <p class="text-sm text-red-400 bg-red-900/50 py-2 px-4 rounded-md">{{ importError() }}</p>
      }
    </div>
    <footer class="flex justify-end space-x-3 p-4 border-t border-slate-700 shrink-0">
      <button type="button" (click)="toggleImportModal()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel</button>
      <button 
        type="button" 
        (click)="handleImport()"
        [disabled]="!selectedFile()" 
        class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition">
        Import
      </button>
    </footer>
  </div>
</div>
}

<!-- Move Bookmarks Modal -->
@if (showMoveModal()) {
<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <form (submit)="handleMoveSelected($event)" class="w-full max-w-md bg-slate-800 rounded-2xl shadow-lg border border-slate-700">
    <header class="flex items-center justify-between p-4 border-b border-slate-700">
      <h2 class="text-xl font-bold text-slate-100">Move {{ selectedBookmarks().size }} Bookmarks</h2>
      <button type="button" (click)="closeMoveModal()" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
    <div class="p-6 space-y-4">
        <div>
            <label for="folder-select" class="block text-sm font-medium text-slate-400 mb-2">Select destination folder</label>
            <select id="folder-select" name="folderId" class="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
              <option value="null">Uncategorized (Root)</option>
              @for(folder of folders(); track folder.id) {
                <option [value]="folder.id">{{ folder.name }}</option>
              }
            </select>
        </div>
    </div>
    <footer class="flex justify-end space-x-3 p-4 border-t border-slate-700">
      <button type="button" (click)="closeMoveModal()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel</button>
      <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">Move Bookmarks</button>
    </footer>
  </form>
</div>
}

<!-- Confirmation Modal -->
@if (confirmationState().isOpen) {
<div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-slate-800 rounded-2xl shadow-lg border border-slate-700">
    <header class="flex items-center justify-between p-4 border-b border-slate-700">
      <h2 class="text-xl font-bold text-red-400">{{ confirmationState().title }}</h2>
      <button type="button" (click)="closeConfirmationModal()" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
    <div class="p-6">
      <p class="text-slate-300">{{ confirmationState().message }}</p>
    </div>
    <footer class="flex justify-end space-x-3 p-4 border-t border-slate-700">
      <button type="button" (click)="closeConfirmationModal()" class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition">Cancel</button>
      <button type="button" (click)="confirmDeletion()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition">Delete</button>
    </footer>
  </div>
</div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkManagerComponent {
  bookmarkService = inject(BookmarkService);
  groupService = inject(GroupService);
  folderService = inject(FolderService);

  // UI state
  showAddMenu = signal(false);
  showExportMenu = signal(false);
  viewMode = signal<'list' | 'folder'>('list');

  // Bookmark state
  bookmarks = this.bookmarkService.bookmarks;
  editingBookmark = signal<Bookmark | null>(null);
  showForm = signal(false);
  newTitle = signal('');
  newUrl = signal('');
  isFormValid = computed(() => this.newTitle().trim().length > 0 && this.newUrl().trim().length > 0);

  // Group state
  groups = this.groupService.groups;
  showGroupManager = signal(false);
  editingGroup = signal<Group | null>(null);
  groupName = signal('');
  groupEmails = signal(''); // Comma-separated string
  isGroupFormValid = computed(() => this.groupName().trim().length > 0 && this.groupEmails().trim().length > 0);
  
  // Folder state
  folders = this.folderService.folders;
  showFolderModal = signal(false);
  newFolderName = signal('');
  isFolderFormValid = computed(() => this.newFolderName().trim().length > 0);

  // Import/Export state
  showImportModal = signal(false);
  importError = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  // Selection and Pagination state
  selectedBookmarks = signal(new Set<string>());
  showMoveModal = signal(false);
  currentPage = signal(1);
  itemsPerPage = signal(6);

  // Drag & Drop state
  draggedBookmarkId = signal<string | null>(null);

  // Confirmation Modal State
  confirmationState = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  paginatedBookmarks = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.bookmarks().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.bookmarks().length / this.itemsPerPage()) || 1);

  pages = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  areAllOnPageSelected = computed(() => {
    const pageBookmarks = this.paginatedBookmarks();
    if (pageBookmarks.length === 0) return false;
    return pageBookmarks.every(b => this.selectedBookmarks().has(b.id));
  });

  areAllBookmarksSelected = computed(() => {
    const totalBookmarks = this.bookmarks().length;
    if (totalBookmarks === 0) return false;
    return this.selectedBookmarks().size === totalBookmarks;
  });

  showSelectAllMessage = computed(() => {
    return this.areAllOnPageSelected() && !this.areAllBookmarksSelected();
  });

  folderNameMap = computed(() => {
    const map = new Map<string, string>();
    this.folders().forEach(folder => map.set(folder.id, folder.name));
    return map;
  });
  
  groupedBookmarks = computed(() => {
    const paginated = this.paginatedBookmarks();
    const folderMap = this.folderNameMap();
    const groups = new Map<string | null, Bookmark[]>();
  
    for (const bookmark of paginated) {
      if (!groups.has(bookmark.folderId)) {
        groups.set(bookmark.folderId, []);
      }
      groups.get(bookmark.folderId)!.push(bookmark);
    }
    
    const result = Array.from(groups.entries())
      .map(([folderId, bookmarks]) => ({
        folderId,
        folderName: folderId ? folderMap.get(folderId) ?? 'Unknown Folder' : 'Uncategorized',
        bookmarks,
      }));
        
    result.sort((a, b) => {
      if (a.folderName === 'Uncategorized') return 1;
      if (b.folderName === 'Uncategorized') return -1;
      return a.folderName.localeCompare(b.folderName);
    });
    
    return result;
  });

  // --- UI Methods ---
  toggleAddMenu(): void {
    this.showAddMenu.update(v => !v);
    this.showExportMenu.set(false);
  }

  toggleExportMenu(): void {
    this.showExportMenu.update(v => !v);
    this.showAddMenu.set(false);
  }

  openAddBookmark(): void {
    this.showForm.set(true);
    this.editingBookmark.set(null);
    this.resetFormFields();
    this.showAddMenu.set(false);
  }

  openManageGroups(): void {
    this.showGroupManager.set(true);
    this.resetGroupForm();
    this.showAddMenu.set(false);
  }
  
  openAddFolder(): void {
    this.showFolderModal.set(true);
    this.newFolderName.set('');
    this.showAddMenu.set(false);
  }

  // --- View Mode Methods ---
  setViewMode(mode: 'list' | 'folder'): void {
    this.viewMode.set(mode);
  }

  // --- Bookmark Methods ---
  toggleForm(): void {
    this.showForm.update(val => !val);
    this.editingBookmark.set(null);
    this.resetFormFields();
  }

  handleDelete(id: string): void {
    this.confirmationState.set({
      isOpen: true,
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete this bookmark?',
      onConfirm: () => {
        this.bookmarkService.deleteBookmark(id);
        this.closeConfirmationModal();
      }
    });
  }

  handleEdit(bookmark: Bookmark): void {
    this.editingBookmark.set(bookmark);
    this.newTitle.set(bookmark.title);
    this.newUrl.set(bookmark.url);
    this.showForm.set(true);
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isFormValid()) return;

    if (this.editingBookmark()) {
      this.bookmarkService.updateBookmark({
        ...this.editingBookmark()!,
        title: this.newTitle(),
        url: this.newUrl(),
      });
    } else {
      this.bookmarkService.addBookmark(this.newTitle(), this.newUrl());
    }
    
    this.resetFormFields();
    this.showForm.set(false);
    this.editingBookmark.set(null);
  }

  resetFormFields(): void {
    this.newTitle.set('');
    this.newUrl.set('');
  }
  
  onTitleInput(event: Event): void { this.newTitle.set((event.target as HTMLInputElement).value); }
  onUrlInput(event: Event): void { this.newUrl.set((event.target as HTMLInputElement).value); }

  getFaviconUrl(url: string): string {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?sz=32&domain=${urlObject.hostname}`;
    } catch (e) {
      return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>';
    }
  }

  // --- Group Methods ---
  toggleGroupManager(): void { this.showGroupManager.update(v => !v); this.resetGroupForm(); }
  handleGroupEdit(group: Group): void { this.editingGroup.set(group); this.groupName.set(group.name); this.groupEmails.set(group.emails.join(', ')); }

  handleGroupDelete(id: string): void {
    this.confirmationState.set({
      isOpen: true,
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group?',
      onConfirm: () => {
        this.groupService.deleteGroup(id);
        if (this.editingGroup()?.id === id) this.resetGroupForm();
        this.closeConfirmationModal();
      }
    });
  }

  handleGroupSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isGroupFormValid()) return;
    const emails = this.groupEmails().split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) return;
    
    if (this.editingGroup()) {
      this.groupService.updateGroup({ ...this.editingGroup()!, name: this.groupName(), emails: emails });
    } else {
      this.groupService.addGroup(this.groupName(), emails);
    }
    this.resetGroupForm();
  }

  resetGroupForm(): void { this.editingGroup.set(null); this.groupName.set(''); this.groupEmails.set(''); }
  onGroupNameInput(event: Event): void { this.groupName.set((event.target as HTMLInputElement).value); }
  onGroupEmailsInput(event: Event): void { this.groupEmails.set((event.target as HTMLInputElement).value); }

  // --- Folder Methods ---
  toggleFolderModal(): void { this.showFolderModal.update(v => !v); }
  onFolderNameInput(event: Event): void { this.newFolderName.set((event.target as HTMLInputElement).value); }

  handleFolderSubmit(event: Event): void {
    event.preventDefault();
    if (!this.isFolderFormValid()) return;
    this.folderService.addFolder(this.newFolderName());
    this.toggleFolderModal();
  }

  // --- Import/Export Methods ---
  toggleImportModal(): void {
    this.showImportModal.update(v => !v);
    this.importError.set(null);
    this.selectedFile.set(null);
  }
  
  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
      this.importError.set(null);
    }
  }

  async handleImport(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.importError.set('Please select a file to import.');
      return;
    }

    const fileContent = await file.text();
    let bookmarks: Bookmark[] = [];
    
    try {
      if (file.name.endsWith('.json')) {
        bookmarks = this.parseJsonBookmarks(fileContent);
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        bookmarks = this.parseHtmlBookmarks(fileContent);
      } else {
        throw new Error('Unsupported file type. Please select a .json or .html file.');
      }

      if (bookmarks.length > 0) {
        this.bookmarkService.importBookmarks(bookmarks);
        alert(`${bookmarks.length} bookmarks imported successfully!`);
        this.toggleImportModal();
      } else {
        throw new Error('No valid bookmarks found in the file.');
      }
    } catch (e: any) {
      this.importError.set(e.message || 'An unexpected error occurred while parsing the file.');
      console.error(e);
    }
  }
  
  private parseJsonBookmarks(jsonContent: string): Bookmark[] {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) {
      throw new Error('Invalid format. The JSON data must be an array of bookmarks.');
    }
    const isValid = data.every(item => 
      item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.url === 'string' && typeof item.createdAt === 'number'
    );
    if (!isValid) {
      throw new Error('Invalid format. Each bookmark object must have id, title, url, and createdAt properties with correct types.');
    }
    return data as Bookmark[];
  }

  private parseHtmlBookmarks(htmlContent: string): Bookmark[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    return links
      .map(link => ({
        id: crypto.randomUUID(),
        url: link.getAttribute('href') || '',
        title: link.textContent?.trim() || '',
        createdAt: (parseInt(link.getAttribute('add_date') || '0', 10) * 1000) || Date.now(),
        folderId: null, // Simple import doesn't preserve folder structure for now
      }))
      .filter(b => b.url && b.title);
  }

  handleExport(format: 'json' | 'html'): void {
    const bookmarks = this.bookmarks();
    if (bookmarks.length === 0) {
      alert('There are no bookmarks to export.');
      return;
    }
    
    let dataStr: string;
    let blobType: string;
    let fileExtension: string;

    if (format === 'json') {
      dataStr = JSON.stringify(bookmarks, null, 2);
      blobType = 'application/json';
      fileExtension = 'json';
    } else {
      let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;
      bookmarks.forEach(bookmark => {
        const timestamp = Math.floor(bookmark.createdAt / 1000);
        const title = bookmark.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${timestamp}">${title}</A>\n`;
      });
      html += `</DL><p>\n`;
      dataStr = html;
      blobType = 'text/html';
      fileExtension = 'html';
    }

    const blob = new Blob([dataStr], { type: blobType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `bookmarks-export-${timestamp}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showExportMenu.set(false);
  }

  // --- Selection and Pagination Methods ---
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleBookmarkSelection(id: string): void {
    this.selectedBookmarks.update(selected => {
      const newSet = new Set(selected);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleSelectAllOnPage(): void {
    const pageBookmarkIds = this.paginatedBookmarks().map(b => b.id);
    const areAllSelected = this.areAllOnPageSelected();
    
    this.selectedBookmarks.update(selected => {
      const newSet = new Set(selected);
      if (areAllSelected) {
        pageBookmarkIds.forEach(id => newSet.delete(id));
      } else {
        pageBookmarkIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  }
  
  clearSelection(): void {
    this.selectedBookmarks.set(new Set());
  }
  
  selectAllBookmarks(): void {
    const allIds = new Set(this.bookmarks().map(b => b.id));
    this.selectedBookmarks.set(allIds);
  }
  
  handleDeleteSelected(): void {
    const selectedIds = Array.from(this.selectedBookmarks());
    if (selectedIds.length === 0) return;
    
    this.confirmationState.set({
      isOpen: true,
      title: 'Delete Selected Bookmarks',
      message: `Are you sure you want to delete ${selectedIds.length} selected bookmarks?`,
      onConfirm: () => {
        this.bookmarkService.deleteBookmarks(selectedIds);
        this.clearSelection();

        // After deletion, check if the current page is now out of bounds.
        // If so, move to the new last page.
        if (this.currentPage() > this.totalPages()) {
          this.currentPage.set(this.totalPages());
        }
        this.closeConfirmationModal();
      }
    });
  }
  
  openMoveModal(): void {
    if (this.selectedBookmarks().size > 0) {
      this.showMoveModal.set(true);
    }
  }

  closeMoveModal(): void {
    this.showMoveModal.set(false);
  }

  handleMoveSelected(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const folderId = formData.get('folderId') as string;
    
    const selectedIds = Array.from(this.selectedBookmarks());
    if (selectedIds.length === 0) return;

    this.bookmarkService.moveBookmarks(selectedIds, folderId === 'null' ? null : folderId);
    this.clearSelection();
    this.closeMoveModal();
  }

  // --- Drag & Drop Methods ---
  onDragStart(event: DragEvent, bookmarkId: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      this.draggedBookmarkId.set(bookmarkId);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // This is necessary to allow dropping
  }

  onDrop(event: DragEvent, targetFolderId: string | null): void {
    event.preventDefault();
    const bookmarkId = this.draggedBookmarkId();
    if (bookmarkId) {
      const bookmark = this.bookmarks().find(b => b.id === bookmarkId);
      // Only move if the folder is different
      if (bookmark && bookmark.folderId !== targetFolderId) {
        this.bookmarkService.moveBookmarks([bookmarkId], targetFolderId);
      }
      this.draggedBookmarkId.set(null);
    }
  }

  // --- Confirmation Modal Methods ---
  closeConfirmationModal(): void {
    this.confirmationState.set({ isOpen: false, title: '', message: '', onConfirm: null });
  }

  confirmDeletion(): void {
    this.confirmationState().onConfirm?.();
  }
}
