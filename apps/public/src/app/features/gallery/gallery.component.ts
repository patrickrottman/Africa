import { Component, inject, computed, signal, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PhotoService } from '../../core/services/photo.service';
import { ScrollService } from '../../core/services/scroll.service';
import { ResponsiveImageComponent } from '../../shared/components/responsive-image.component';

@Component({
  selector: 'app-gallery',
  imports: [
    RouterLink,
    ScrollingModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    ResponsiveImageComponent,
  ],
  template: `
    <div class="gallery-container">
      <header class="gallery-header">
        <div class="header-text">
          <span class="eyebrow">Photo Collection</span>
          <h1>Gallery</h1>
        </div>

        @if (allTags().length > 0) {
          <div class="filter-section">
            <mat-chip-listbox [multiple]="true" (change)="onTagChange($event)">
              @for (tag of allTags(); track tag) {
                <mat-chip-option [value]="tag" [selected]="selectedTags().has(tag)">
                  {{ tag }}
                </mat-chip-option>
              }
            </mat-chip-listbox>

            @if (selectedTags().size > 0) {
              <button mat-button class="clear-filters" (click)="clearFilters()">
                <mat-icon>close</mat-icon>
                Clear filters
              </button>
            }
          </div>
        }

        <p class="photo-count">
          {{ filteredPhotos().length }} {{ filteredPhotos().length === 1 ? 'photo' : 'photos' }}
        </p>
      </header>

      <div class="photo-grid">
        @for (photo of filteredPhotos(); track photo.id) {
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
          </a>
        }
      </div>

      @if (filteredPhotos().length === 0) {
        <div class="empty-state">
          @if (photoService.isLoading()) {
            <mat-icon class="loading-icon">photo_library</mat-icon>
            <p>Loading photos...</p>
          } @else if (selectedTags().size > 0) {
            <mat-icon>filter_alt_off</mat-icon>
            <p>No photos match the selected filters</p>
            <button mat-stroked-button (click)="clearFilters()">Clear filters</button>
          } @else {
            <mat-icon>photo_library</mat-icon>
            <p>No photos available yet</p>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .gallery-container {
      padding: 3rem 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .gallery-header {
      margin-bottom: 2.5rem;
    }

    .header-text {
      margin-bottom: 1.5rem;
    }

    .eyebrow {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-ochre);
      margin-bottom: 0.5rem;
    }

    h1 {
      margin: 0;
      color: var(--color-text);
    }

    .filter-section {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    mat-chip-listbox {
      flex: 1;
    }

    .clear-filters {
      color: var(--color-text-secondary);
    }

    .clear-filters mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 0.25rem;
    }

    .photo-count {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      margin: 0;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .photo-card {
      display: block;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-surface-variant);
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      touch-action: manipulation;
    }

    .photo-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .photo-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
      min-height: 150px;
    }

    :host ::ng-deep .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
      pointer-events: none;
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
      pointer-events: none;
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
      margin-bottom: 1.5rem;
    }

    .loading-icon {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    @media (max-width: 600px) {
      .gallery-container {
        padding: 2rem 1rem;
      }

      .photo-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .photo-card {
        border-radius: var(--radius-md);
      }

      .photo-card:hover {
        transform: none;
      }

      .photo-overlay {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .photo-card,
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
export class GalleryComponent implements AfterViewInit {
  private scrollService = inject(ScrollService);
  photoService = inject(PhotoService);
  allTags = this.photoService.allTags;

  selectedTags = signal(new Set<string>());

  filteredPhotos = computed(() => {
    const photos = this.photoService.photos();
    const tags = this.selectedTags();

    if (tags.size === 0) {
      return photos;
    }

    return photos.filter((photo) =>
      [...tags].every((tag) => photo.tags.includes(tag))
    );
  });

  ngAfterViewInit(): void {
    this.scrollService.restorePosition('gallery');
  }

  onPhotoClick(): void {
    this.scrollService.savePosition('gallery');
  }

  onTagChange(event: { value: string[] }): void {
    this.selectedTags.set(new Set(event.value));
  }

  clearFilters(): void {
    this.selectedTags.set(new Set());
  }
}
