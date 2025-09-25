import { Component } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { BookmarkManagerComponent } from './components/bookmark-manager/bookmark-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
<div class="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
  <app-bookmark-manager />
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BookmarkManagerComponent],
})
export class AppComponent {
}