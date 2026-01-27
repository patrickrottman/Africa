import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="brand-name">Naledi Safari</span>
          <span class="brand-tagline">Capturing the wild beauty of South Africa</span>
        </div>

        <nav class="footer-nav">
          <a routerLink="/gallery">Gallery</a>
          <a routerLink="/journal">Journal</a>
          <a routerLink="/lodge">The Lodge</a>
          <a routerLink="/about">About</a>
        </nav>

        <div class="footer-copy">
          <span>&copy; {{ currentYear }} Patrick Rottman</span>
          <span class="separator">·</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      padding: 3rem 1.5rem;
      padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0));
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      text-align: center;
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .brand-name {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 1.25rem;
      color: var(--color-text);
    }

    .brand-tagline {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      letter-spacing: 0.02em;
    }

    .footer-nav {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-nav a {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .footer-nav a:hover {
      color: var(--color-accent);
    }

    .footer-copy {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .separator {
      opacity: 0.5;
    }

    @media (max-width: 480px) {
      .footer-copy {
        flex-direction: column;
        gap: 0.25rem;
      }

      .separator {
        display: none;
      }
    }
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
