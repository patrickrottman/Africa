import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar class="header">
      <button
        mat-icon-button
        class="menu-button"
        (click)="toggleNav()"
        aria-label="Toggle menu"
      >
        <mat-icon>{{ navOpen() ? 'close' : 'menu' }}</mat-icon>
      </button>

      <a routerLink="/" class="logo" (click)="closeNav()">
        <span class="logo-text">Naledi</span>
        <span class="logo-accent">Safari</span>
      </a>

      <nav class="desktop-nav">
        <a
          mat-button
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: true}"
        >
          Home
        </a>
        <a mat-button routerLink="/gallery" routerLinkActive="active">Gallery</a>
        <a mat-button routerLink="/journal" routerLinkActive="active">Journal</a>
        <a mat-button routerLink="/lodge" routerLinkActive="active">The Lodge</a>
        <a mat-button routerLink="/about" routerLinkActive="active">About</a>
      </nav>

      <span class="spacer"></span>

      <button
        mat-icon-button
        class="theme-toggle"
        (click)="themeService.toggle()"
        [matTooltip]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
        aria-label="Toggle theme"
      >
        <mat-icon class="theme-icon">
          {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
        </mat-icon>
      </button>
    </mat-toolbar>

    @if (navOpen()) {
      <div class="mobile-nav-backdrop" (click)="closeNav()"></div>
    }

    <nav class="mobile-nav" [class.open]="navOpen()">
      <a routerLink="/" (click)="closeNav()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon>home</mat-icon>
        Home
      </a>
      <a routerLink="/gallery" (click)="closeNav()" routerLinkActive="active">
        <mat-icon>collections</mat-icon>
        Gallery
      </a>
      <a routerLink="/journal" (click)="closeNav()" routerLinkActive="active">
        <mat-icon>auto_stories</mat-icon>
        Journal
      </a>
      <a routerLink="/lodge" (click)="closeNav()" routerLinkActive="active">
        <mat-icon>cabin</mat-icon>
        The Lodge
      </a>
      <a routerLink="/about" (click)="closeNav()" routerLinkActive="active">
        <mat-icon>info</mat-icon>
        About
      </a>
      <div class="mobile-nav-divider"></div>
      <button class="mobile-theme-toggle" (click)="themeService.toggle()">
        <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        {{ themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
      </button>
    </nav>
  `,
  styles: `
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--color-deep-green);
      color: #fff;
      height: var(--header-height);
      padding: 0 1rem;
      box-shadow: var(--shadow-lg);
    }

    .menu-button {
      display: none;
      color: #fff;
      margin-right: 0.5rem;
    }

    .logo {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      text-decoration: none;
      color: #fff;
      transition: opacity 0.2s;
    }

    .logo:hover {
      opacity: 0.9;
      color: #fff;
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .logo-accent {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.85;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .desktop-nav {
      margin-left: 2.5rem;
      display: flex;
      gap: 0.25rem;
    }

    .desktop-nav a {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-size: 0.9rem;
      letter-spacing: 0.01em;
      padding: 0 1rem;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }

    .desktop-nav a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    .desktop-nav a.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
    }

    .spacer {
      flex: 1;
    }

    .theme-toggle {
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.2s;
    }

    .theme-toggle:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    .theme-icon {
      transition: transform 0.3s ease;
    }

    .theme-toggle:hover .theme-icon {
      transform: rotate(15deg);
    }

    .mobile-nav-backdrop {
      display: none;
    }

    .mobile-nav {
      display: none;
    }

    @media (max-width: 900px) {
      .menu-button {
        display: flex;
      }

      .desktop-nav {
        display: none;
      }

      .mobile-nav-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        top: var(--header-height);
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
      }

      .mobile-nav {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: var(--header-height);
        left: 0;
        right: 0;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        z-index: 999;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s;
        padding: 0.5rem 0;
      }

      .mobile-nav.open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .mobile-nav a {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        color: var(--color-text);
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      }

      .mobile-nav a:hover {
        background: var(--color-surface-variant);
        color: var(--color-text);
      }

      .mobile-nav a.active {
        color: var(--color-ochre);
        background: var(--color-surface-variant);
      }

      .mobile-nav a mat-icon {
        color: var(--color-text-secondary);
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .mobile-nav a.active mat-icon {
        color: var(--color-ochre);
      }

      .mobile-nav-divider {
        height: 1px;
        background: var(--color-border);
        margin: 0.5rem 1rem;
      }

      .mobile-theme-toggle {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-family: var(--font-body);
        font-size: 1rem;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s;
      }

      .mobile-theme-toggle:hover {
        background: var(--color-surface-variant);
      }

      .mobile-theme-toggle mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    @media (max-width: 480px) {
      .logo-accent {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .mobile-nav {
        transition: none;
      }
    }
  `,
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  navOpen = signal(false);

  toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }
}
