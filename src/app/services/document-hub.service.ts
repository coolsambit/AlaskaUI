import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, timeout, switchMap, catchError, throwError } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

export interface DocumentItem {
  id: string;
  name: string;
  project?: string;
  category?: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentHubService {
  private base = environment.documentHubEndpoint;

  constructor(private http: HttpClient, private msalService: MsalService) { }

  listDocuments(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(`${this.base}/documents`);
  }

  searchDocuments(q: string): Observable<DocumentItem[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<DocumentItem[]>(`${this.base}/documents/search`, { params });
  }

  getDocument(id: string): Observable<DocumentItem> {
    return this.http.get<DocumentItem>(`${this.base}/documents/${id}`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  /**
   * Acquire a token for the Function App, falling back to popup if silent fails.
   */
  private getApiToken(): Observable<string> {
    const account = this.msalService.instance.getActiveAccount()
                 || this.msalService.instance.getAllAccounts()[0];
    if (!account) {
      return throwError(() => ({ status: 401, message: 'No signed-in account. Please sign in first.' }));
    }
    const request = { scopes: environment.functionApp.scopes, account };
    return from(this.msalService.instance.acquireTokenSilent(request)).pipe(
      catchError(() =>
        // Silent failed (no cached token / consent needed) → try popup
        from(this.msalService.instance.acquireTokenPopup(request))
      ),
      switchMap(result => {
        if (!result?.accessToken) {
          return throwError(() => ({ status: 401, message: 'Could not acquire access token.' }));
        }
        return from([result.accessToken]);
      }),
      catchError(err => {
        console.error('Token acquisition failed:', err);
        return throwError(() => ({
          status: 401,
          message: 'Authentication failed. Please sign in again.',
          error: err
        }));
      })
    );
  }

  uploadDocument(file: File, metadata: { projectId: string; categoryId: string; notes?: string; }): Observable<any> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('projectId', metadata.projectId);
    form.append('categoryId', metadata.categoryId);
    if (metadata.notes) {
      form.append('notes', metadata.notes);
    }
    if (environment.storage?.enabled && environment.storage.functionUrl) {
      // Manually acquire token, then POST with Authorization header
      return this.getApiToken().pipe(
        switchMap(token => {
          const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
          return this.http.post(environment.storage.functionUrl, form, {
            headers,
            responseType: 'text'
          });
        }),
        timeout(120000) // 2 minute timeout
      );
    }
    return this.http.post(`${this.base}/documents`, form, { responseType: 'text' })
      .pipe(timeout(120000));
  }
}
