import {
  Component,
  inject,
  input,
  computed,
  signal,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PhotoService } from '../../core/services/photo.service';
import { BlurhashPlaceholderComponent } from '../../shared/components/blurhash-placeholder.component';
import { formatDate, formatBytes, isInternalTag } from '@africa/shared';

@Component({
  selector: 'app-photo-viewer',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    BlurhashPlaceholderComponent,
  ],
  template: `
    <div
      class="viewer-container"
      [class.chrome-hidden]="chromeHidden()"
      (click)="toggleChrome($event)"
    >
      @if (photo(); as p) {
        <div class="image-container">
          @if (!imageLoaded()) {
            <app-blurhash-placeholder
              [hash]="p.placeholder"
              [width]="64"
              [height]="64"
            />
          }
          <picture [class.loaded]="imageLoaded()">
            @if (p.variants.large.avifUrl) {
              <source [srcset]="p.variants.large.avifUrl" type="image/avif" />
            }
            @if (p.variants.large.webpUrl) {
              <source [srcset]="p.variants.large.webpUrl" type="image/webp" />
            }
            <img
              [src]="p.variants.large.jpgUrl"
              [alt]="p.description || 'Safari photo'"
              (load)="onImageLoad()"
              draggable="false"
            />
          </picture>
        </div>

        <header class="viewer-header">
          <button mat-icon-button (click)="goBack($event)" aria-label="Go back">
            <mat-icon>arrow_back</mat-icon>
          </button>

          <div class="header-actions">
            <button
              mat-icon-button
              (click)="copyShareLink($event)"
              matTooltip="Copy link"
              aria-label="Copy share link"
            >
              <mat-icon>{{ linkCopied() ? 'check' : 'share' }}</mat-icon>
            </button>

            <a
              mat-icon-button
              [href]="p.variants.original.jpgUrl"
              download
              matTooltip="Download original"
              aria-label="Download original"
              (click)="$event.stopPropagation()"
            >
              <mat-icon>download</mat-icon>
            </a>

            <button
              mat-icon-button
              (click)="toggleInfo($event)"
              matTooltip="Photo info"
              aria-label="Toggle photo info"
            >
              <mat-icon>info</mat-icon>
            </button>
          </div>
        </header>

        @if (adjacent().prev) {
          <button
            class="nav-button nav-prev"
            mat-icon-button
            (click)="navigatePrev($event)"
            aria-label="Previous photo"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
        }

        @if (adjacent().next) {
          <button
            class="nav-button nav-next"
            mat-icon-button
            (click)="navigateNext($event)"
            aria-label="Next photo"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        }

        @if (showInfo()) {
          <aside class="info-panel" (click)="$event.stopPropagation()">
            <button
              mat-icon-button
              class="close-info"
              (click)="toggleInfo($event)"
              aria-label="Close info panel"
            >
              <mat-icon>close</mat-icon>
            </button>

            @if (p.description) {
              <p class="description">{{ p.description }}</p>
            }

            <div class="info-grid">
              @if (p.takenAt) {
                <div class="info-label">Date</div>
                <div class="info-value">{{ formatDate(p.takenAt) }}</div>
              }

              <div class="info-label">Dimensions</div>
              <div class="info-value">{{ p.width }} × {{ p.height }}</div>

              @if (p.exif?.cameraMake) {
                <div class="info-label">Camera maker</div>
                <div class="info-value">{{ p.exif?.cameraMake }}</div>
              }

              @if (p.exif?.cameraModel) {
                <div class="info-label">Camera model</div>
                <div class="info-value">{{ p.exif?.cameraModel }}</div>
              }

              @if (p.exif?.fStop) {
                <div class="info-label">F-stop</div>
                <div class="info-value">f/{{ p.exif?.fStop }}</div>
              }

              @if (p.exif?.exposureTime) {
                <div class="info-label">Exposure time</div>
                <div class="info-value">{{ p.exif?.exposureTime }}</div>
              }

              @if (p.exif?.iso) {
                <div class="info-label">ISO speed</div>
                <div class="info-value">ISO-{{ p.exif?.iso }}</div>
              }

              @if (p.exif?.exposureBias !== null && p.exif?.exposureBias !== undefined) {
                <div class="info-label">Exposure bias</div>
                <div class="info-value">{{ p.exif?.exposureBias }} step</div>
              }

              @if (p.exif?.focalLength) {
                <div class="info-label">Focal length</div>
                <div class="info-value">{{ p.exif?.focalLength }} mm</div>
              }

              @if (p.exif?.maxAperture) {
                <div class="info-label">Max aperture</div>
                <div class="info-value">{{ p.exif?.maxAperture }}</div>
              }

              @if (p.exif?.meteringMode) {
                <div class="info-label">Metering mode</div>
                <div class="info-value">{{ p.exif?.meteringMode }}</div>
              }

              @if (p.exif?.flash) {
                <div class="info-label">Flash mode</div>
                <div class="info-value">{{ p.exif?.flash }}</div>
              }

              @if (p.exif?.focalLength35mm) {
                <div class="info-label">35mm focal length</div>
                <div class="info-value">{{ p.exif?.focalLength35mm }}</div>
              }

              <div class="info-label">File size</div>
              <div class="info-value">{{ formatBytes(p.variants.original.bytes) }}</div>
            </div>

            @if (publicTags().length > 0) {
              <div class="tags">
                @for (tag of publicTags(); track tag) {
                  <a [routerLink]="['/gallery']" [queryParams]="{tag}" class="tag">
                    {{ tag }}
                  </a>
                }
              </div>
            }
          </aside>
        }

        <footer class="filmstrip">
          <div class="filmstrip-track">
            @for (thumb of photos(); track thumb.id) {
              <a
                [routerLink]="['/photo', thumb.id]"
                class="filmstrip-item"
                [class.active]="thumb.id === id()"
                (click)="$event.stopPropagation()"
              >
                <img
                  [src]="thumb.variants.thumb.jpgUrl"
                  [alt]="thumb.description || 'Thumbnail'"
                  loading="lazy"
                />
              </a>
            }
          </div>
        </footer>
      } @else {
        <div class="not-found">
          <p>Photo not found</p>
          <a mat-button routerLink="/gallery">Return to Gallery</a>
        </div>
      }
    </div>
  `,
  styles: `
    .viewer-container {
      position: fixed;
      inset: 0;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .image-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-container picture {
      display: contents;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .image-container picture.loaded {
      opacity: 1;
    }

    .image-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      user-select: none;
    }

    .viewer-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      padding-top: calc(1rem + env(safe-area-inset-top, 0));
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
      transition: opacity 0.3s ease;
      color: white;
    }

    .viewer-header a,
    .viewer-header button {
      color: white !important;
    }

    .header-actions {
      display: flex;
      gap: 0.25rem;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: white !important;
      background: rgba(0, 0, 0, 0.6) !important;
      width: 48px;
      height: 48px;
      transition: opacity 0.3s ease, background 0.2s ease;
    }

    .nav-button:hover {
      background: rgba(0, 0, 0, 0.85) !important;
    }

    .nav-button mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .nav-prev {
      left: 1.5rem;
    }

    .nav-next {
      right: 1.5rem;
    }

    .info-panel {
      position: absolute;
      top: 80px;
      right: 1.5rem;
      width: 320px;
      max-width: calc(100vw - 3rem);
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius-lg, 12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    .close-info {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .close-info:hover {
      color: white !important;
    }

    .description {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.95);
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5rem 1rem;
      font-size: 0.85rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .info-label {
      color: rgba(255, 255, 255, 0.5);
      white-space: nowrap;
    }

    .info-value {
      color: rgba(255, 255, 255, 0.9);
      text-align: right;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tag {
      background: rgba(194, 112, 62, 0.2);
      border: 1px solid rgba(194, 112, 62, 0.4);
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      color: #c2703e;
      text-decoration: none;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .tag:hover {
      background: rgba(194, 112, 62, 0.35);
      border-color: rgba(194, 112, 62, 0.6);
    }

    .filmstrip {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
      padding: 1.25rem 1.5rem;
      padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0));
      transition: opacity 0.3s ease;
    }

    .filmstrip-track {
      display: flex;
      gap: 0.625rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding: 0.25rem 0;
    }

    .filmstrip-track::-webkit-scrollbar {
      height: 6px;
    }

    .filmstrip-track::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .filmstrip-track::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .filmstrip-item {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 6px;
      overflow: hidden;
      scroll-snap-align: center;
      opacity: 0.5;
      transition: opacity 0.2s ease, transform 0.2s ease;
      border: 2px solid transparent;
    }

    .filmstrip-item.active {
      opacity: 1;
      border-color: #c2703e;
      box-shadow: 0 0 12px rgba(194, 112, 62, 0.4);
    }

    .filmstrip-item:hover {
      opacity: 0.85;
    }

    .filmstrip-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .chrome-hidden .viewer-header,
    .chrome-hidden .nav-button,
    .chrome-hidden .filmstrip {
      opacity: 0;
      pointer-events: none;
    }

    .not-found {
      text-align: center;
      color: white;
      padding: 2rem;
    }

    .not-found p {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .not-found a {
      color: #c2703e !important;
      border-color: #c2703e !important;
    }

    @media (max-width: 768px) {
      .nav-button {
        display: none;
      }

      .info-panel {
        top: auto;
        bottom: 110px;
        left: 1rem;
        right: 1rem;
        width: auto;
        max-height: 50vh;
        overflow-y: auto;
      }

      .filmstrip-item {
        width: 56px;
        height: 56px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .viewer-header,
      .nav-button,
      .filmstrip,
      .image-container picture,
      .filmstrip-item,
      .tag {
        transition: none;
      }
    }
  `,
})
export class PhotoViewerComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private location = inject(Location);
  private photoService = inject(PhotoService);

  id = input.required<string>();

  photo = computed(() => this.photoService.getPhotoById(this.id()));
  photos = this.photoService.photos;
  adjacent = computed(() => this.photoService.getAdjacentPhotos(this.id()));

  publicTags = computed(() => {
    const p = this.photo();
    if (!p) return [];
    return p.tags.filter((t) => !isInternalTag(t));
  });

  imageLoaded = signal(false);
  chromeHidden = signal(false);
  showInfo = signal(false);
  linkCopied = signal(false);

  formatDate = formatDate;
  formatBytes = formatBytes;

  private touchStartX = 0;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  goBack(event: Event): void {
    event.stopPropagation();
    this.location.back();
  }

  toggleChrome(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button, a, .info-panel')) {
      return;
    }
    this.chromeHidden.update((v) => !v);
  }

  toggleInfo(event: Event): void {
    event.stopPropagation();
    this.showInfo.update((v) => !v);
  }

  copyShareLink(event: Event): void {
    event.stopPropagation();
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    });
  }

  navigatePrev(event: Event): void {
    event.stopPropagation();
    const prev = this.adjacent().prev;
    if (prev) {
      this.imageLoaded.set(false);
      this.router.navigate(['/photo', prev.id]);
    }
  }

  navigateNext(event: Event): void {
    event.stopPropagation();
    const next = this.adjacent().next;
    if (next) {
      this.imageLoaded.set(false);
      this.router.navigate(['/photo', next.id]);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.navigatePrev(event);
        break;
      case 'ArrowRight':
        this.navigateNext(event);
        break;
      case 'Escape':
        this.location.back();
        break;
      case 'i':
        this.showInfo.update((v) => !v);
        break;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchEndX - this.touchStartX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.navigatePrev(event);
      } else {
        this.navigateNext(event);
      }
    }
  }
}
