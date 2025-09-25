import { Injectable, computed, inject } from '@angular/core';
import { GoogleApiService } from './google-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private googleApiService = inject(GoogleApiService);

  isAuthenticated = this.googleApiService.isLoggedIn;

  login(): void {
    this.googleApiService.signIn();
  }

  logout(): void {
    this.googleApiService.signOut();
  }
}