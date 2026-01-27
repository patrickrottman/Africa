import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PhotoUpdatePayload, BulkTagPayload } from '@africa/shared';

export interface AdminPhoto {
  id: string;
  filename: string;
  tags: string[];
  description: string | null;
  takenAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  getPhotos(): Observable<AdminPhoto[]> {
    return this.http.get<AdminPhoto[]>(`${this.baseUrl}/photos`);
  }

  getPhoto(id: string): Observable<AdminPhoto> {
    return this.http.get<AdminPhoto>(`${this.baseUrl}/photos/${id}`);
  }

  updatePhoto(id: string, payload: PhotoUpdatePayload): Observable<AdminPhoto> {
    return this.http.patch<AdminPhoto>(`${this.baseUrl}/photos/${id}`, payload);
  }

  setHero(id: string): Observable<{ success: boolean; heroId: string }> {
    return this.http.post<{ success: boolean; heroId: string }>(
      `${this.baseUrl}/photos/${id}/hero`,
      {}
    );
  }

  bulkAddTags(payload: BulkTagPayload): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/photos/bulk/tags/add`,
      payload
    );
  }

  bulkRemoveTags(payload: BulkTagPayload): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/photos/bulk/tags/remove`,
      payload
    );
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tags`);
  }

  getThumbUrl(filename: string): string {
    return `${this.baseUrl}/thumb/${encodeURIComponent(filename)}`;
  }
}
