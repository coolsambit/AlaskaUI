import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Global interceptor that catches 401/403 responses from API calls
 * and logs a warning. Individual components handle their own UI messaging,
 * but this ensures no unauthorized call goes silently unnoticed.
 */
@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn(
            `[AuthErrorInterceptor] 401 Unauthorized: ${req.method} ${req.url}. ` +
            'The user does not have valid credentials for this resource.'
          );
        } else if (error.status === 403) {
          console.warn(
            `[AuthErrorInterceptor] 403 Forbidden: ${req.method} ${req.url}. ` +
            'The user does not have permission to access this resource.'
          );
        }
        // Re-throw so individual component error handlers still fire
        return throwError(() => error);
      })
    );
  }
}
