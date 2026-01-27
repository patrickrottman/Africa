import { Component, inject, computed, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PhotoService } from '../../core/services/photo.service';
import { ScrollService } from '../../core/services/scroll.service';
import { ResponsiveImageComponent } from '../../shared/components/responsive-image.component';
import { formatDate } from '@africa/shared';

@Component({
  selector: 'app-journal',
  imports: [RouterLink, MatIconModule, ResponsiveImageComponent],
  template: `
    <div class="journal-container">
      <header class="journal-header">
        <span class="eyebrow">Chronicles</span>
        <h1>Photo Journal</h1>
        <p class="subtitle">A chronological journey through the African bush</p>
      </header>

      @for (entry of groupedPhotos(); track entry.date) {
        <section class="day-section">
          <h2 class="day-header">
            <mat-icon>calendar_today</mat-icon>
            <span class="date">{{ formatDate(entry.date) }}</span>
            <span class="count">{{ entry.photos.length }} {{ entry.photos.length === 1 ? 'photo' : 'photos' }}</span>
          </h2>

          <div class="day-grid">
            @for (photo of entry.photos; track photo.id) {
              <a [routerLink]="['/photo', photo.id]" class="photo-card" (click)="onPhotoClick()">
                <div class="photo-wrapper" [style.aspect-ratio]="photo.aspectRatio">
                  <app-responsive-image
                    [variant]="photo.variants.thumb"
                    [alt]="photo.description || 'Safari photo'"
                    imgClass="photo-img"
                  />
                  <div class="photo-overlay">
                    <mat-icon>fullscreen</mat-icon>
                  </div>
                </div>
                @if (photo.description) {
                  <p class="photo-description">{{ photo.description }}</p>
                }
              </a>
            }
          </div>
        </section>
      }

      @if (groupedPhotos().length === 0) {
        <div class="empty-state">
          @if (photoService.isLoading()) {
            <mat-icon class="loading-icon">photo_library</mat-icon>
            <p>Loading journal...</p>
          } @else {
            <mat-icon>event_busy</mat-icon>
            <p>No journal entries yet</p>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .journal-container {
      padding: 3rem 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .journal-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-ochre);
      margin-bottom: 0.5rem;
    }

    .journal-header h1 {
      margin: 0 0 0.75rem;
      color: var(--color-text);
    }

    .subtitle {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    .day-section {
      margin-bottom: 3.5rem;
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0 0 1.5rem;
      padding: 1rem 0;
      border-bottom: 2px solid var(--color-border);
      position: sticky;
      top: 64px;
      background: var(--color-background);
      z-index: 10;
    }

    .day-header mat-icon {
      color: var(--color-ochre);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .day-header .date {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .day-header .count {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      font-weight: 400;
      margin-left: auto;
      background: var(--color-surface);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
    }

    .day-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .photo-card {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .photo-wrapper {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-surface-variant);
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .photo-card:hover .photo-wrapper {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    :host ::ng-deep .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .photo-card:hover :host ::ng-deep .photo-img {
      transform: scale(1.05);
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }

    .photo-overlay mat-icon {
      color: white;
      font-size: 32px;
      width: 32px;
      height: 32px;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .photo-card:hover .photo-overlay {
      background: rgba(0, 0, 0, 0.3);
    }

    .photo-card:hover .photo-overlay mat-icon {
      opacity: 1;
      transform: scale(1);
    }

    .photo-description {
      margin: 0.875rem 0 0;
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .empty-state {
      text-align: center;
      padding: 6rem 1.5rem;
      color: var(--color-text-secondary);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }

    .empty-state p {
      font-size: 1.1rem;
      margin: 0;
    }

    .loading-icon {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    @media (max-width: 600px) {
      .journal-container {
        padding: 2rem 1rem;
      }

      .journal-header {
        margin-bottom: 2.5rem;
      }

      .day-section {
        margin-bottom: 2.5rem;
      }

      .day-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .photo-wrapper {
        border-radius: var(--radius-md);
      }

      .photo-card:hover .photo-wrapper {
        transform: none;
      }

      .photo-overlay {
        display: none;
      }

      .photo-description {
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .photo-wrapper,
      :host ::ng-deep .photo-img,
      .photo-overlay,
      .photo-overlay mat-icon {
        transition: none;
      }

      .photo-card:hover :host ::ng-deep .photo-img {
        transform: none;
      }

      .loading-icon {
        animation: none;
      }
    }
  `,
})
export class JournalComponent implements AfterViewInit {
  private scrollService = inject(ScrollService);
  photoService = inject(PhotoService);
  formatDate = formatDate;

  groupedPhotos = computed(() => {
    const byDate = this.photoService.photosByDate();
    const entries: Array<{ date: string; photos: typeof photos }> = [];
    const photos = this.photoService.photos();

    for (const [date, datePhotos] of byDate) {
      entries.push({ date, photos: datePhotos });
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  });

  ngAfterViewInit(): void {
    this.scrollService.restorePosition('journal');
  }

  onPhotoClick(): void {
    this.scrollService.savePosition('journal');
  }
}
