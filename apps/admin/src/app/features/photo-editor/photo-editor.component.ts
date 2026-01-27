import { Component, inject, input, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AdminApiService, AdminPhoto } from '../../core/services/admin-api.service';
import { PhotoAdminService } from '../../core/services/photo-admin.service';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-photo-editor',
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="editor-container">
      <header class="editor-header">
        <a mat-icon-button routerLink="/">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1>Edit Photo</h1>
      </header>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner diameter="40" />
        </div>
      } @else if (photo()) {
        <div class="editor-content">
          <div class="preview-section">
            <img
              [src]="thumbUrl()"
              [alt]="photo()!.filename"
              class="preview-image"
            />
            <p class="filename">{{ photo()!.filename }}</p>

            @if (photo()!.tags.includes('_hero')) {
              <span class="hero-badge">Current Hero Photo</span>
            } @else {
              <button mat-stroked-button (click)="setAsHero()">
                <mat-icon>star</mat-icon>
                Set as Hero Photo
              </button>
            }
          </div>

          <mat-card class="edit-section">
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  [(ngModel)]="description"
                  rows="3"
                  placeholder="Add a description for this photo"
                ></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags</mat-label>
                <mat-chip-grid #chipGrid>
                  @for (tag of tags(); track tag) {
                    <mat-chip-row (removed)="removeTag(tag)">
                      {{ tag }}
                      <button matChipRemove>×</button>
                    </mat-chip-row>
                  }
                  <input
                    matInput
                    [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
                    (matChipInputTokenEnd)="addTag($event)"
                    [matAutocomplete]="auto"
                    [(ngModel)]="tagInput"
                  />
                </mat-chip-grid>
                <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectTag($event)">
                  @for (tag of filteredTags(); track tag) {
                    <mat-option [value]="tag">{{ tag }}</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <div class="actions">
                <button mat-button routerLink="/">Cancel</button>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="save()"
                  [disabled]="isSaving()"
                >
                  @if (isSaving()) {
                    <mat-spinner diameter="20" />
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <div class="not-found">
          <p>Photo not found</p>
          <a mat-button routerLink="/">Back to Dashboard</a>
        </div>
      }
    </div>
  `,
  styles: `
    .editor-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .editor-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
    }

    .loading, .not-found {
      text-align: center;
      padding: 4rem;
    }

    .editor-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 1.5rem;
    }

    .preview-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .preview-image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }

    .filename {
      margin: 0;
      font-size: 0.875rem;
      color: #666;
      word-break: break-all;
    }

    .hero-badge {
      background: #ff9800;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
    }

    .edit-section {
      height: fit-content;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .editor-content {
        grid-template-columns: 1fr;
      }

      .preview-section {
        max-width: 300px;
        margin: 0 auto;
      }
    }
  `,
})
export class PhotoEditorComponent implements OnInit {
  id = input.required<string>();

  private api = inject(AdminApiService);
  private photoAdminService = inject(PhotoAdminService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  separatorKeyCodes = [ENTER, COMMA];

  photo = signal<AdminPhoto | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);

  description = '';
  tags = signal<string[]>([]);
  tagInput = '';

  thumbUrl = computed(() => {
    const p = this.photo();
    return p ? this.api.getThumbUrl(p.filename) : '';
  });

  filteredTags(): string[] {
    const query = this.tagInput.toLowerCase();
    const current = this.tags();
    return this.photoAdminService
      .allTags()
      .filter((t) => t.toLowerCase().includes(query) && !current.includes(t));
  }

  ngOnInit(): void {
    this.loadPhoto();
  }

  private async loadPhoto(): Promise<void> {
    this.isLoading.set(true);
    try {
      const photo = await firstValueFrom(this.api.getPhoto(this.id()));
      this.photo.set(photo);
      this.description = photo.description || '';
      this.tags.set([...photo.tags]);
    } catch {
      this.photo.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  addTag(event: { value: string; chipInput: { clear: () => void } }): void {
    const value = event.value.trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update((t) => [...t, value]);
    }
    event.chipInput.clear();
    this.tagInput = '';
  }

  selectTag(event: { option: { value: string } }): void {
    const value = event.option.value;
    if (!this.tags().includes(value)) {
      this.tags.update((t) => [...t, value]);
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags.update((t) => t.filter((x) => x !== tag));
  }

  async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      await firstValueFrom(
        this.api.updatePhoto(this.id(), {
          tags: this.tags(),
          description: this.description || null,
        })
      );
      this.snackBar.open('Changes saved', 'Dismiss', { duration: 3000 });
      await this.photoAdminService.loadPhotos();
      this.router.navigate(['/']);
    } catch (err) {
      this.snackBar.open('Failed to save changes', 'Dismiss', { duration: 5000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  async setAsHero(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Set as Hero Photo',
        message:
          'This will set this photo as the hero image on the homepage. The previous hero photo will be unset.',
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    try {
      await this.photoAdminService.setHero(this.id());
      this.snackBar.open('Hero photo updated', 'Dismiss', { duration: 3000 });
      await this.loadPhoto();
    } catch {
      this.snackBar.open('Failed to set hero photo', 'Dismiss', { duration: 5000 });
    }
  }
}
