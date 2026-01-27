import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PhotoAdminService } from '../../core/services/photo-admin.service';
import { BulkTagDialogComponent } from './bulk-tag-dialog.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Photo Management</h1>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search photos</mat-label>
          <input
            matInput
            [ngModel]="photoService.searchQuery()"
            (ngModelChange)="photoService.searchQuery.set($event)"
            placeholder="Search by filename, tag, or description"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </header>

      @if (photoService.selectedIds().size > 0) {
        <div class="bulk-toolbar">
          <span class="selection-count">
            {{ photoService.selectedIds().size }} selected
          </span>

          <button mat-button (click)="openBulkAddDialog()">
            <mat-icon>add</mat-icon>
            Add Tags
          </button>

          <button mat-button (click)="openBulkRemoveDialog()">
            <mat-icon>remove</mat-icon>
            Remove Tags
          </button>

          <button mat-button (click)="photoService.clearSelection()">
            <mat-icon>clear</mat-icon>
            Clear Selection
          </button>
        </div>
      }

      @if (photoService.isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40" />
          <span>Loading photos...</span>
        </div>
      } @else {
        <div class="photo-grid">
          @for (photo of photoService.filteredPhotos(); track photo.id) {
            <mat-card class="photo-card">
              <div class="card-header">
                <mat-checkbox
                  [checked]="photoService.selectedIds().has(photo.id)"
                  (change)="photoService.toggleSelection(photo.id)"
                />
                @if (photo.tags.includes('_hero')) {
                  <span class="hero-badge">HERO</span>
                }
              </div>

              <a [routerLink]="['/photo', photo.id]" class="photo-link">
                <img
                  [src]="photoService.getThumbUrl(photo)"
                  [alt]="photo.filename"
                  class="photo-thumb"
                />
              </a>

              <mat-card-content>
                <p class="filename">{{ photo.filename }}</p>

                @if (photo.tags.length > 0) {
                  <div class="tags">
                    @for (tag of photo.tags; track tag) {
                      <span class="tag" [class.internal]="tag.startsWith('_')">
                        {{ tag }}
                      </span>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>

        @if (photoService.filteredPhotos().length === 0) {
          <div class="empty-state">
            @if (photoService.searchQuery()) {
              <p>No photos match your search.</p>
            } @else {
              <p>No photos found. Add JPEGs to photos/original/ and restart the server.</p>
            }
          </div>
        }
      }
    </div>
  `,
  styles: `
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
      flex: 1;
    }

    .search-field {
      width: 300px;
    }

    .bulk-toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #e3f2fd;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .selection-count {
      font-weight: 500;
      margin-right: auto;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 4rem;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .photo-card {
      position: relative;
    }

    .card-header {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      right: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      z-index: 1;
    }

    .hero-badge {
      background: #ff9800;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 700;
    }

    .photo-link {
      display: block;
    }

    .photo-thumb {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 4px 4px 0 0;
    }

    mat-card-content {
      padding: 0.75rem;
    }

    .filename {
      margin: 0 0 0.5rem;
      font-size: 0.75rem;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .tag {
      background: #e0e0e0;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.625rem;
    }

    .tag.internal {
      background: #ffecb3;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: #666;
    }
  `,
})
export class DashboardComponent implements OnInit {
  photoService = inject(PhotoAdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.photoService.loadPhotos();
  }

  openBulkAddDialog(): void {
    const dialogRef = this.dialog.open(BulkTagDialogComponent, {
      data: { mode: 'add', existingTags: this.photoService.allTags() },
    });

    dialogRef.afterClosed().subscribe(async (tags: string[] | undefined) => {
      if (tags?.length) {
        await this.photoService.bulkAddTags(tags);
        this.snackBar.open('Tags added', 'Dismiss', { duration: 3000 });
      }
    });
  }

  openBulkRemoveDialog(): void {
    const selectedTags = new Set<string>();
    for (const photo of this.photoService.selectedPhotos()) {
      for (const tag of photo.tags) {
        selectedTags.add(tag);
      }
    }

    const dialogRef = this.dialog.open(BulkTagDialogComponent, {
      data: { mode: 'remove', existingTags: [...selectedTags] },
    });

    dialogRef.afterClosed().subscribe(async (tags: string[] | undefined) => {
      if (tags?.length) {
        await this.photoService.bulkRemoveTags(tags);
        this.snackBar.open('Tags removed', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
