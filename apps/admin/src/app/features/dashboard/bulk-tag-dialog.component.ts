import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface DialogData {
  mode: 'add' | 'remove';
  existingTags: string[];
}

@Component({
  selector: 'app-bulk-tag-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'add' ? 'Add Tags' : 'Remove Tags' }}
    </h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tags</mat-label>
        <mat-chip-grid #chipGrid>
          @for (tag of selectedTags; track tag) {
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
            [(ngModel)]="inputValue"
          />
        </mat-chip-grid>
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectTag($event)">
          @for (tag of filteredTags(); track tag) {
            <mat-option [value]="tag">{{ tag }}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="selectedTags.length === 0"
        (click)="confirm()"
      >
        {{ data.mode === 'add' ? 'Add' : 'Remove' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 300px;
    }
  `,
})
export class BulkTagDialogComponent {
  private dialogRef = inject(MatDialogRef<BulkTagDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  separatorKeyCodes = [ENTER, COMMA];
  selectedTags: string[] = [];
  inputValue = '';

  filteredTags(): string[] {
    const query = this.inputValue.toLowerCase();
    return this.data.existingTags.filter(
      (tag) =>
        tag.toLowerCase().includes(query) && !this.selectedTags.includes(tag)
    );
  }

  addTag(event: { value: string; chipInput: { clear: () => void } }): void {
    const value = event.value.trim();
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    event.chipInput.clear();
    this.inputValue = '';
  }

  selectTag(event: { option: { value: string } }): void {
    const value = event.option.value;
    if (!this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    this.inputValue = '';
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
  }

  confirm(): void {
    this.dialogRef.close(this.selectedTags);
  }
}
