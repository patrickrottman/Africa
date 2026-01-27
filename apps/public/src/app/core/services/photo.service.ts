import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Manifest, Photo } from '@africa/shared';
import { isInternalTag, groupPhotosByDate } from '@africa/shared';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PhotoService implements OnDestroy {
  private http = inject(HttpClient);
  private subscription: Subscription | null = null;

  private manifest = signal<Manifest | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<Error | null>(null);

  constructor() {
    this.loadManifest();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadManifest(): void {
    this.subscription = this.http.get<Manifest>('assets/photos/manifest.json').subscribe({
      next: (data) => {
        this.manifest.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.isLoading.set(false);
      },
    });
  }

  readonly allPhotos = computed(() => {
    return this.manifest()?.photos ?? [];
  });

  readonly heroPhoto = computed(() => {
    const photos = this.allPhotos();
    return photos.find((p) => p.tags.includes('_hero')) ?? photos[0] ?? null;
  });

  readonly photos = computed(() => {
    const hero = this.heroPhoto();
    return this.allPhotos().filter((p) => p.id !== hero?.id);
  });

  readonly tagIndex = computed(() => {
    return this.manifest()?.tagIndex ?? {};
  });

  readonly allTags = computed(() => {
    const index = this.tagIndex();
    return Object.keys(index)
      .filter((tag) => !isInternalTag(tag))
      .sort();
  });

  readonly photosByDate = computed(() => {
    return groupPhotosByDate(this.photos());
  });

  getPhotoById(id: string): Photo | undefined {
    return this.allPhotos().find((p) => p.id === id);
  }

  getPhotosByTag(tag: string): Photo[] {
    const ids = this.tagIndex()[tag] ?? [];
    const idSet = new Set(ids);
    return this.photos().filter((p) => idSet.has(p.id));
  }

  getPhotoIndex(id: string): number {
    return this.photos().findIndex((p) => p.id === id);
  }

  getAdjacentPhotos(id: string): { prev: Photo | null; next: Photo | null } {
    const photos = this.photos();
    const index = this.getPhotoIndex(id);
    if (index === -1) {
      return { prev: null, next: photos[0] ?? null };
    }
    return {
      prev: index > 0 ? photos[index - 1] : null,
      next: index < photos.length - 1 ? photos[index + 1] : null,
    };
  }
}
