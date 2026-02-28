import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DocumentHubService } from '../services/document-hub.service';

@Component({
  selector: 'app-document-intelligence',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Document Intelligence Operations</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label for="fullpath">Full Path of the File</label>
      <input id="fullpath" formControlName="fullpathofthefile" type="text" style="width: 400px;" />
      <br><br>
      <label for="secret">Document Intelligence Secret</label>
      <input id="secret" formControlName="documentIntelligenceSecret" type="text" style="width: 400px;" />
      <br><br>
      <button type="submit">Call Document Intelligence</button>
    </form>
    <div *ngIf="result">
      <h3>Result</h3>
      <pre>{{ result | json }}</pre>
    </div>
    <div *ngIf="error">
      <h3>Error</h3>
      <pre>{{ error }}</pre>
    </div>
  `
})
export class DocumentIntelligenceComponent {
  form: FormGroup;
  result: any = null;
  error: string = '';

  constructor(private fb: FormBuilder, private hub: DocumentHubService) {
    this.form = this.fb.group({
      fullpathofthefile: [''],
      documentIntelligenceSecret: ['']
    });
  }

  onSubmit() {
    const { fullpathofthefile, documentIntelligenceSecret } = this.form.value;
    this.result = null;
    this.error = '';
    this.hub.callDocumentIntelligence(fullpathofthefile, documentIntelligenceSecret).subscribe({
      next: res => this.result = res,
      error: err => this.error = typeof err?.error === 'string' ? err.error : JSON.stringify(err?.error)
    });
  }
}