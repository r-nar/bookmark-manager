import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GoogleApiService } from '../../services/google-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
<div class="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 text-center">
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 9h6v6H9z" />
    </svg>
    <h1 class="text-3xl font-bold text-slate-100 mt-4">Secure Bookmark Manager</h1>
    <p class="text-slate-400 mt-2">Sign in with your Google Account to securely store and manage your bookmarks in Google Drive.</p>
  </div>
  
  <div class="h-16 flex items-center justify-center">
    @if (apiError()) {
      <p class="text-sm text-red-400 bg-red-900/50 py-2 px-4 rounded-md">{{ apiError() }}</p>
    } @else if (isApiReady()) {
      <button (click)="handleLogin()" class="w-full inline-flex items-center justify-center py-3 px-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-transform transform active:scale-95">
        <svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.447-2.275,4.482-4.28,5.942	l6.19,5.238C39.957,35.663,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
        <span>Sign in with Google</span>
      </button>
    } @else {
      <div class="flex items-center justify-center space-x-2 text-slate-400">
        <svg class="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Initializing...</span>
      </div>
    }
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  googleApiService = inject(GoogleApiService);
  
  isApiReady = this.googleApiService.isApiReady;
  apiError = this.googleApiService.apiError;

  handleLogin(): void {
    this.authService.login();
  }
}
