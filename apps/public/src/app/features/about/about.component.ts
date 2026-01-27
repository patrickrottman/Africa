import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="about-container">
      <header class="about-header">
        <span class="eyebrow">Behind the Lens</span>
        <h1>About This Project</h1>
      </header>

      <div class="content-grid">
        <section class="content-section">
          <h2>The Photographer</h2>
          <p>
            This collection represents my wildlife photography from safari trips to
            Naledi Game Lodge in South Africa. Each image captures a moment of Africa's
            incredible natural beauty and the diverse wildlife that calls it home.
          </p>
          <p>
            Photography has always been my way of preserving fleeting moments in nature,
            and the African bush provides an endless source of inspiration and wonder.
          </p>
        </section>

        <section class="content-section">
          <h2>The Website</h2>
          <p>
            Built with Angular and designed for optimal viewing of photography.
            Images are served in modern formats (AVIF, WebP) with responsive sizing
            to ensure fast loading on any device while maintaining quality.
          </p>
          <p>
            All photo metadata is embedded directly in the original JPEG files,
            making the collection portable and preserving information across platforms.
          </p>
        </section>

        <section class="content-section tech-section">
          <h2>Technical Details</h2>
          <ul class="tech-list">
            <li>
              <mat-icon>code</mat-icon>
              <span>Angular 20 with standalone components and signals</span>
            </li>
            <li>
              <mat-icon>palette</mat-icon>
              <span>Angular Material for UI components</span>
            </li>
            <li>
              <mat-icon>image</mat-icon>
              <span>AVIF/WebP/JPEG image format support</span>
            </li>
            <li>
              <mat-icon>blur_on</mat-icon>
              <span>BlurHash placeholders for smooth loading</span>
            </li>
            <li>
              <mat-icon>dark_mode</mat-icon>
              <span>Dark mode support with system preference detection</span>
            </li>
            <li>
              <mat-icon>phone_iphone</mat-icon>
              <span>Mobile-first responsive design</span>
            </li>
          </ul>
        </section>
      </div>

      <div class="connect-section">
        <h2>Connect</h2>
        <div class="social-links">
          <a
            mat-stroked-button
            href="https://patrickrottman.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <mat-icon>language</mat-icon>
            Website
          </a>
          <a
            mat-stroked-button
            href="https://github.com/patrickrottman"
            target="_blank"
            rel="noopener noreferrer"
          >
            <mat-icon>code</mat-icon>
            GitHub
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .about-container {
      padding: 3rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .about-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-ochre);
      margin-bottom: 0.75rem;
    }

    .about-header h1 {
      margin: 0;
      color: var(--color-text);
    }

    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .content-section h2 {
      font-size: 1.5rem;
      margin: 0 0 1.25rem;
      color: var(--color-ochre);
      position: relative;
      padding-left: 1rem;
    }

    .content-section h2::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.15em;
      bottom: 0.15em;
      width: 3px;
      background: var(--color-ochre);
      border-radius: 2px;
    }

    .content-section p {
      font-size: 1.1rem;
      line-height: 1.85;
      color: var(--color-text-secondary);
      margin: 0 0 1rem;
    }

    .content-section p:last-child {
      margin-bottom: 0;
    }

    .tech-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tech-list li {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1rem;
      color: var(--color-text-secondary);
      padding: 0.75rem 1rem;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    .tech-list mat-icon {
      color: var(--color-ochre);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .connect-section {
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 1px solid var(--color-border);
      text-align: center;
    }

    .connect-section h2 {
      font-size: 1.5rem;
      margin: 0 0 1.5rem;
      color: var(--color-text);
    }

    .social-links {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .social-links a {
      color: var(--color-ochre) !important;
      border-color: var(--color-ochre) !important;
      min-width: 140px;
    }

    .social-links mat-icon {
      margin-right: 0.5rem;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .about-container {
        padding: 2rem 1rem;
      }

      .about-header {
        margin-bottom: 3rem;
      }

      .content-grid {
        gap: 2.5rem;
      }
    }
  `,
})
export class AboutComponent {}
