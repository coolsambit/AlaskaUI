import { Injectable } from '@angular/core';
import { DocumentHubService } from '../services/document-hub.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DocumentIntelligenceWorkflowService {
  constructor(private hub: DocumentHubService) {}

  runDocumentIntelligence(filePath: string, documentIntelligenceSecret: string = ''): Observable<any> {
    if (!filePath) {
      return of(null);
    }
    return this.hub.callDocumentIntelligence(filePath, documentIntelligenceSecret).pipe(
      tap(res => {
        // Optionally handle result, e.g. show notification or log
        console.log('DocumentIntelligenceOperations result:', res);
      }),
      catchError(err => {
        // Optionally handle error
        console.error('DocumentIntelligenceOperations error:', err);
        throw err;
      })
    );
  }
}
