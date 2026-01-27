import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PhotoService } from '../../core/services/photo.service';
import { BlurhashPlaceholderComponent } from '../../shared/components/blurhash-placeholder.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, BlurhashPlaceholderComponent],
  template: `
    <section class="hero">
      @if (heroPhoto(); as hero) {
        <div class="hero-image-container">
          @if (!imageLoaded()) {
            <app-blurhash-placeholder [hash]="hero.placeholder" />
          }
          <picture [class.loaded]="imageLoaded()">
            @if (hero.variants.large.avifUrl) {
              <source [srcset]="hero.variants.large.avifUrl" type="image/avif" />
            }
            @if (hero.variants.large.webpUrl) {
              <source [srcset]="hero.variants.large.webpUrl" type="image/webp" />
            }
            <img
              [src]="hero.variants.large.jpgUrl"
              [alt]="hero.description || 'Safari hero image'"
              (load)="onImageLoad()"
              loading="eager"
              fetchpriority="high"
            />
          </picture>
        </div>
      }

      <div class="hero-overlay"></div>

      <div class="hero-content">
        <span class="hero-eyebrow">Wildlife Photography</span>
        <h1>Naledi Game Lodge</h1>
        <p class="tagline">
          Capturing the untamed beauty of South Africa's wilderness
        </p>

        <div class="cta-buttons">
          <a mat-flat-button routerLink="/gallery" class="cta-primary">
            <mat-icon>collections</mat-icon>
            Explore Gallery
          </a>
          <a mat-stroked-button routerLink="/journal" class="cta-secondary">
            <mat-icon>auto_stories</mat-icon>
            Photo Journal
          </a>
        </div>
      </div>

      <div class="scroll-indicator">
        <mat-icon>expand_more</mat-icon>
      </div>
    </section>

    <section class="intro">
      <div class="intro-content">
        <span class="section-eyebrow">Welcome to Naledi</span>
        <h2>Where Every Frame Tells a Story</h2>
        <p>
          These photographs capture the raw beauty and intimate moments of safari life
          at Naledi Game Lodge in Limpopo Province, South Africa. From majestic elephants
          to elusive leopards, every image preserves a fleeting glimpse of Africa's
          incredible biodiversity.
        </p>
        <div class="intro-cta">
          <a mat-stroked-button routerLink="/lodge" class="learn-more">
            Learn About the Lodge
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      height: calc(100vh - var(--header-height));
      min-height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-image-container {
      position: absolute;
      inset: 0;
    }

    .hero-image-container picture {
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.8s ease;
    }

    .hero-image-container picture.loaded {
      opacity: 1;
    }

    .hero-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.35) 0%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.5) 100%
      );
    }

    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      padding: 2rem;
      max-width: 800px;
    }

    .hero-eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.9;
      margin-bottom: 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-lg);
    }

    h1 {
      font-size: clamp(3rem, 10vw, 5rem);
      font-weight: 700;
      margin: 0 0 1rem;
      line-height: 1.1;
      color: #fff;
      text-shadow:
        0 0 30px rgba(255, 255, 255, 0.5),
        0 0 60px rgba(255, 255, 255, 0.3),
        0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .tagline {
      font-size: clamp(1.1rem, 3vw, 1.4rem);
      margin: 0 0 2.5rem;
      opacity: 0.95;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      font-weight: 400;
      line-height: 1.5;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-buttons a {
      min-width: 180px;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
    }

    .cta-buttons mat-icon {
      margin-right: 0.5rem;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .cta-primary {
      background: var(--color-ochre) !important;
      color: #fff !important;
      box-shadow: 0 4px 15px rgba(194, 112, 62, 0.4) !important;
    }

    .cta-primary:hover {
      background: var(--color-ochre-dark) !important;
    }

    .cta-secondary {
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(4px);
    }

    .cta-secondary:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: #fff !important;
    }

    .scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.7);
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      40% {
        transform: translateX(-50%) translateY(-8px);
      }
      60% {
        transform: translateX(-50%) translateY(-4px);
      }
    }

    .intro {
      padding: 6rem 1.5rem;
      background: var(--color-background);
    }

    .intro-content {
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
    }

    .section-eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-ochre);
      margin-bottom: 1rem;
    }

    .intro h2 {
      margin: 0 0 1.5rem;
      color: var(--color-text);
    }

    .intro p {
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--color-text-secondary);
      margin: 0 0 2rem;
    }

    .intro-cta {
      margin-top: 2rem;
    }

    .learn-more {
      color: var(--color-ochre) !important;
      border-color: var(--color-ochre) !important;
    }

    .learn-more mat-icon {
      margin-left: 0.5rem;
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: transform 0.2s;
    }

    .learn-more:hover mat-icon {
      transform: translateX(4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-image-container picture {
        transition: none;
        opacity: 1;
      }

      .scroll-indicator {
        animation: none;
      }

      .learn-more:hover mat-icon {
        transform: none;
      }
    }

    @media (max-width: 600px) {
      .hero {
        height: 70vh;
        min-height: 400px;
        max-height: 500px;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-buttons a {
        width: 100%;
        max-width: 280px;
      }

      .scroll-indicator {
        display: none;
      }

      .intro {
        padding: 4rem 1.5rem;
      }
    }
  `,
})
export class HomeComponent {
  private photoService = inject(PhotoService);
  heroPhoto = this.photoService.heroPhoto;
  imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}
