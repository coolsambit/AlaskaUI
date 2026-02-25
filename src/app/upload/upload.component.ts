import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentHubService, Project, Category } from '../services/document-hub.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .upload-status {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .upload-status.uploading {
      background-color: #e8f0fe;
      color: #1a73e8;
      border: 1px solid #c6dafc;
    }
    .upload-status.success {
      background-color: #e6f4ea;
      color: #1e8e3e;
      border: 1px solid #b7e1cd;
    }
    .upload-status.error {
      background-color: #fce8e6;
      color: #d93025;
      border: 1px solid #f5c6cb;
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #c6dafc;
      border-top: 3px solid #1a73e8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .status-icon {
      font-size: 18px;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
  template: `
    <h2>Upload documents</h2>
    <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
      <label for="fileInput">File</label>
      <input #fileInput id="fileInput" type="file" (change)="onFileChange($event)" />
      <br><br>
      <label for="projectSelect">Project</label>
      <select id="projectSelect" formControlName="project">
        <option value="">--Please Select--</option>
        <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
      </select>
      <br><br>
      <label for="categorySelect">Category</label>
      <select id="categorySelect" formControlName="category">
        <option value="">--Please Select--</option>
        <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
      </select>
      <br><br>
      <label for="notes">Notes</label>
      <textarea id="notes" formControlName="notes" maxlength="3000" rows="4" cols="50" placeholder="Enter notes (max 3000 chars)"></textarea>
      <br><br>
      <button type="submit" [disabled]="!selectedFile || isUploading">
        {{ isUploading ? 'Uploading...' : 'Upload' }}
      </button>
    </form>

    <div class="upload-status uploading" *ngIf="isUploading">
      <div class="spinner"></div>
      <span>Uploading your document, please wait...</span>
    </div>

    <div class="upload-status success" *ngIf="statusMessage === 'success'">
      <span class="status-icon">&#10004;</span>
      <span>Status: Upload successful! Your document has been stored.</span>
    </div>

    <div class="upload-status error" *ngIf="statusMessage === 'error'">
      <span class="status-icon">&#10008;</span>
      <span>Status: Upload failed — {{ errorDetail }}</span>
    </div>
  `
})
export class UploadComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  uploadForm: FormGroup;
  projects: Project[] = [
    { id: 'ProjectA', name: 'ProjectA' },
    { id: 'ProjectB', name: 'ProjectB' },
    { id: 'ProjectC', name: 'ProjectC' }
  ];
  categories: Category[] = [];

  // map of project to its category list
  private projectCategories: { [projectId: string]: Category[] } = {
    ProjectA: [
      { id: 'CategoryA1', name: 'CategoryA1' },
      { id: 'CategoryA2', name: 'CategoryA2' },
      { id: 'CategoryA3', name: 'CategoryA3' },
      { id: 'CategoryA4', name: 'CategoryA4' }
    ],
    ProjectB: [
      { id: 'CategoryB1', name: 'CategoryB1' },
      { id: 'CategoryB2', name: 'CategoryB2' }
    ],
    ProjectC: [
      { id: 'CategoryC1', name: 'CategoryC1' },
      { id: 'CategoryC2', name: 'CategoryC2' }
    ]
  };
  selectedFile?: File;
  isUploading = false;
  statusMessage: 'success' | 'error' | null = null;
  errorDetail = '';

  constructor(private fb: FormBuilder, private hub: DocumentHubService) {
    this.uploadForm = this.fb.group({ project: [''], category: [''], notes: [''] });
  }

  ngOnInit(): void {
    // update categories when project changes
    this.uploadForm.get('project')?.valueChanges.subscribe(projectId => {
      this.categories = this.projectCategories[projectId] || [];
      // reset category control whenever project changes
      this.uploadForm.get('category')?.setValue('');
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Clear any previous status when a new file is picked
      this.statusMessage = null;
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      // Show spinner, clear previous status
      this.isUploading = true;
      this.statusMessage = null;
      this.errorDetail = '';

      const data = {
        projectId: this.uploadForm.value.project,
        categoryId: this.uploadForm.value.category,
        notes: this.uploadForm.value.notes
      };
      this.hub.uploadDocument(this.selectedFile, data).subscribe({
        next: () => {
          this.isUploading = false;
          this.statusMessage = 'success';
          // Reset form, file input, and button
          this.uploadForm.reset();
          this.selectedFile = undefined;
          if (this.fileInputRef) {
            this.fileInputRef.nativeElement.value = '';
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.isUploading = false;
          this.statusMessage = 'error';

          // Extract a human-readable message from the HttpErrorResponse
          if (err?.status === 401) {
            this.errorDetail = 'You do not have access to this resource. Please sign in with a valid account.';
          } else if (err?.status === 403) {
            this.errorDetail = 'Access denied. You do not have permission to perform this action.';
          } else {
            const body = err?.error;
            if (typeof body === 'string') {
              this.errorDetail = body;
            } else if (body?.message) {
              this.errorDetail = body.message;
            } else if (body?.error) {
              this.errorDetail = typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
            } else if (err?.status === 0) {
              this.errorDetail = 'Could not reach the server. Please check your network connection.';
            } else if (err?.status) {
              this.errorDetail = `Server returned status ${err.status}: ${err.statusText || 'Unknown error'}`;
            } else if (err?.message) {
              this.errorDetail = err.message;
            } else {
              this.errorDetail = 'An unexpected error occurred.';
            }
          }
        }
      });
    }
  }
}
