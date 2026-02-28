

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentHubService {
    callDocumentIntelligence(fullpathofthefile: string, documentIntelligenceSecret: string) {
      const body = {
        fullpathofthefile,
        documentIntelligenceSecret
      };
      return this.http.post(`${this.base}/DocumentIntelligenceOperations`, body);
    }
  private base = environment.documentHubEndpoint;

  constructor(private http: HttpClient) { }

  uploadDocument(file: File, projectId: string, categoryId: string, notes: string): Observable<any> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('projectId', projectId);
    form.append('categoryId', categoryId);
    form.append('notes', notes);
    return this.http.post(`${this.base}/documents`, form);
  }
}
