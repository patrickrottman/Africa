import { Injectable, inject, signal, computed } from '@angular/core';
import { AdminApiService, AdminPhoto } from './admin-api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PhotoAdminService {
  private api = inject(AdminApiService);

  readonly photos = signal<AdminPhoto[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly allTags = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');

  readonly filteredPhotos = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const photos = this.photos();

    if (!query) return photos;

    return photos.filter(
      (p) =>
        p.filename.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.description?.toLowerCase().includes(query) ?? false)
    );
  });

  readonly selectedPhotos = computed(() => {
    const ids = this.selectedIds();
    return this.photos().filter((p) => ids.has(p.id));
  });

  async loadPhotos(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [photos, tags] = await Promise.all([
        firstValueFrom(this.api.getPhotos()),
        firstValueFrom(this.api.getTags()),
      ]);
      this.photos.set(photos);
      this.allTags.set(tags);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleSelection(id: string): void {
    this.selectedIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.filteredPhotos().map((p) => p.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  async bulkAddTags(tags: string[]): Promise<void> {
    const ids = [...this.selectedIds()];
    if (ids.length === 0 || tags.length === 0) return;

    await firstValueFrom(this.api.bulkAddTags({ photoIds: ids, tags }));
    await this.loadPhotos();
  }

  async bulkRemoveTags(tags: string[]): Promise<void> {
    const ids = [...this.selectedIds()];
    if (ids.length === 0 || tags.length === 0) return;

    await firstValueFrom(this.api.bulkRemoveTags({ photoIds: ids, tags }));
    await this.loadPhotos();
  }

  async setHero(id: string): Promise<void> {
    await firstValueFrom(this.api.setHero(id));
    await this.loadPhotos();
  }

  getThumbUrl(photo: AdminPhoto): string {
    return this.api.getThumbUrl(photo.filename);
  }
}
