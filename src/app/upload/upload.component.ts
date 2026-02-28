interface Project {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocumentHubService } from '../services/document-hub.service';
import { DocumentIntelligenceWorkflowService } from './document-intelligence.service';
import { ErrorHandler } from '../services/error-handler';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./upload.component.css'],
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
  statusMessage: 'success' | 'error' | 'extracting' | null = null;
  errorDetail = '';
  extracting = false;

  constructor(
    private fb: FormBuilder,
    private hub: DocumentHubService,
    private docIntelligenceWorkflow: DocumentIntelligenceWorkflowService
  ) {
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
      this.isUploading = true;
      this.statusMessage = null;
      this.errorDetail = '';

      const projectId = this.uploadForm.value.project || '';
      const categoryId = this.uploadForm.value.category || '';
      const notes = this.uploadForm.value.notes || '';
      this.hub.uploadDocument(this.selectedFile, projectId, categoryId, notes).subscribe({
        next: (uploadRes) => {
          this.isUploading = false;
          this.statusMessage = 'extracting';
          this.extracting = true;
          // Reset form, file input, and button
          this.uploadForm.reset();
          this.selectedFile = undefined;
          if (this.fileInputRef) {
            this.fileInputRef.nativeElement.value = '';
          }

          // Call DocumentIntelligenceOperations after upload success using workflow service
          const fullpathofthefile = uploadRes?.filePath || '';
          const documentIntelligenceSecret = '';
          this.docIntelligenceWorkflow.runDocumentIntelligence(fullpathofthefile, documentIntelligenceSecret).subscribe({
            next: res => {
              this.statusMessage = 'success';
              this.extracting = false;
            },
            error: err => {
              this.statusMessage = 'error';
              this.extracting = false;
            }
          });
        },
          error: (err) => {
            console.error('Upload error:', err);
            this.isUploading = false;
            this.statusMessage = 'error';
            this.errorDetail = ErrorHandler.getErrorMessage(err);
          }
      });
    }
  }
}

