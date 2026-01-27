import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <a mat-button routerLink="/">
        <mat-icon>dashboard</mat-icon>
        Photo Admin
      </a>
      <span class="spacer"></span>
      <span class="status">Local Development Only</span>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .spacer {
      flex: 1;
    }

    .status {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .main-content {
      flex: 1;
      padding: 1rem;
      background: #f5f5f5;
    }
  `,
})
export class AppComponent {}
