import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DocumentHubService, DocumentItem } from '../services/document-hub.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h2>Documents</h2>
    <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
      <input formControlName="query" placeholder="Search text" />
      <button type="submit">Search</button>
    </form>
    <ul>
      @for (doc of documents; track doc.id) {
        <li>
          <a [routerLink]="['/viewer']" [queryParams]="{ id: doc.id }">
            {{ doc.name }} ({{ doc.project }} / {{ doc.category }})
          </a>
        </li>
      }
    </ul>
  `
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  documents: DocumentItem[] = [];

  constructor(private fb: FormBuilder, private hub: DocumentHubService) {
    this.searchForm = this.fb.group({ query: [''] });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.hub.listDocuments().subscribe(docs => this.documents = docs);
  }

  onSearch(): void {
    const q = this.searchForm.value.query;
    this.hub.searchDocuments(q).subscribe(docs => this.documents = docs);
  }
}
