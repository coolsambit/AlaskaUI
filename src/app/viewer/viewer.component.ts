import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DocumentHubService, DocumentItem } from '../services/document-hub.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Document viewer</h2>
    <!-- only render when there's a document to avoid undefined access -->
    <div *ngIf="doc">
      <ng-container *ngIf="doc">
        <p><strong>{{ doc?.name }}</strong></p>
        <iframe *ngIf="doc?.url" [src]="doc.url" width="100%" height="600px"></iframe>
      </ng-container>
    </div>
  `
})
export class ViewerComponent implements OnInit {
  doc?: DocumentItem;

  constructor(private route: ActivatedRoute, private hub: DocumentHubService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.hub.getDocument(id).subscribe(d => this.doc = d);
    }
  }
}
