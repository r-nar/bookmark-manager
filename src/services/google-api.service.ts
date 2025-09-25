import { Injectable, signal, inject, Injector, NgZone } from '@angular/core';
import { GOOGLE_CONFIG } from '../google-api.config';
import { BookmarkService } from './bookmark.service';
import { GroupService } from './group.service';
import { Bookmark } from '../models/bookmark.model';
import { Group } from '../models/group.model';

// TypeScript declarations for the Google API and Identity Services clients,
// which are loaded from external scripts.
declare var gapi: any;
declare var google: any;

const DATA_FILE_NAME = 'bookmarks-data.json';

interface AppData {
  bookmarks: Bookmark[];
  groups: Group[];
}

@Injectable({
  providedIn: 'root',
})
export class GoogleApiService {
  private injector = inject(Injector);
  private ngZone = inject(NgZone);

  // Lazily inject services to prevent circular dependencies
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

  isApiReady = signal(false);
  apiError = signal<string | null>(null);
  isLoggedIn = signal(false);

  private tokenClient: any;
  private fileId: string | null = null;

  constructor() {
    this.loadGapiClient();
  }

  private loadGapiClient(): void {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => this.ngZone.run(() => this.initializeGapiClient());
    document.body.appendChild(script);
  }

  private initializeGapiClient(): void {
    gapi.load('client', async () => {
      try {
        // The gapi.client.init call loads the discovery documents for the APIs.
        // We don't need to pass the clientId here as authentication is handled
        // by the newer Google Identity Services (GIS) library.
        await gapi.client.init({
          discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
        });
        this.loadGsiClient();
      } catch (err: any) {
        this.apiError.set('Failed to initialize Google API client. Check console for details.');
        console.error("GAPI client init error:", err);
      }
    });
  }
  
  private loadGsiClient(): void {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.ngZone.run(() => this.initializeGsiClient());
      document.body.appendChild(script);
  }

  private initializeGsiClient(): void {
    try {
      if (!google || !google.accounts || !google.accounts.oauth2) {
        throw new Error('Google Identity Services library not loaded correctly.');
      }
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: (tokenResponse: any) => {
          this.ngZone.run(() => {
            if (tokenResponse.error) {
              this.apiError.set(`Google Sign-In error: ${tokenResponse.error_description || tokenResponse.error}`);
              console.error("Token error:", tokenResponse);
              this.isLoggedIn.set(false);
              return;
            }
            // Explicitly set the token for gapi. This ensures that subsequent
            // calls to Drive, Docs, etc., are authenticated.
            gapi.client.setToken(tokenResponse);
            this.isLoggedIn.set(true);
            this.loadData();
          });
        },
      });
      this.isApiReady.set(true);
    } catch (err: any) {
      this.apiError.set('Failed to initialize Google Sign-In. Check console for details.');
      console.error("GSI client init error:", err);
    }
  }

  signIn(): void {
    // The GIS library is smart enough to prompt for consent if it's the first time,
    // or to get a token silently if the user has already consented.
    // Passing an empty object uses the default behavior, which is the most robust way.
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({});
    } else {
      console.error("Token client not initialized. Cannot sign in.");
      this.apiError.set("Sign-in client is not ready. Please refresh the page.");
    }
  }

  signOut(): void {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
         this.ngZone.run(() => {
            gapi.client.setToken(null);
            this.isLoggedIn.set(false);
            this.bookmarkService.setInitialData([]);
            this.groupService.setInitialData([]);
         });
      });
    }
  }

  private async findOrCreateDataFile(): Promise<string> {
    const response = await gapi.client.drive.files.list({
      q: `name='${DATA_FILE_NAME}' and trashed=false and 'root' in parents`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });
    
    if (response.result.files.length > 0) {
      return response.result.files[0].id;
    } else {
      const fileMetadata = {
        name: DATA_FILE_NAME,
        mimeType: 'application/json',
      };
      const createResponse = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      return createResponse.result.id;
    }
  }

  async loadData(): Promise<void> {
    try {
      this.fileId = await this.findOrCreateDataFile();
      const response = await gapi.client.drive.files.get({
        fileId: this.fileId,
        alt: 'media',
      });

      const data: AppData = response.result || { bookmarks: [], groups: [] };
      this.bookmarkService.setInitialData(data.bookmarks);
      this.groupService.setInitialData(data.groups);

    } catch (err: any) {
      console.error('Error loading data:', err);
      // Handle case where file is empty or corrupt
      this.bookmarkService.setInitialData([]);
      this.groupService.setInitialData([]);
    }
  }

  async saveData(): Promise<void> {
    if (!this.fileId) {
      console.error('No file ID to save to. Cannot save data.');
      return;
    }

    const data: AppData = {
      bookmarks: this.bookmarkService.bookmarks(),
      groups: this.groupService.groups(),
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: DATA_FILE_NAME,
      mimeType: 'application/json'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;
      
    try {
        await gapi.client.request({
            path: `/upload/drive/v3/files/${this.fileId}`,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
            body: multipartRequestBody
        });
    } catch (err) {
        console.error('Error saving data:', err);
    }
  }

  async shareBookmarkAsDoc(bookmark: Bookmark, group: Group): Promise<void> {
    // 1. Create the Google Doc
    const docResponse = await gapi.client.docs.documents.create({
      title: `Shared Bookmark: ${bookmark.title}`,
    });
    const docId = docResponse.result.documentId;

    // 2. Insert content into the Doc
    const requests = [{
      insertText: {
        location: { index: 1 },
        text: `Shared via Bookmark Manager\n\nTitle: ${bookmark.title}\nURL: ${bookmark.url}\n`
      }
    }];
    await gapi.client.docs.documents.batchUpdate({
      documentId: docId,
      requests,
    });
    
    // 3. Share the doc with group members
    for (const email of group.emails) {
      try {
        await gapi.client.drive.permissions.create({
          fileId: docId,
          resource: {
            type: 'user',
            role: 'reader',
            emailAddress: email
          },
          sendNotificationEmail: true
        });
      } catch (err) {
        console.warn(`Could not share with ${email}. Maybe an invalid address?`, err);
      }
    }
  }
}
