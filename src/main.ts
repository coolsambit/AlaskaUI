import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MsalModule, MsalInterceptor } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { AuthErrorInterceptor } from './app/interceptors/auth-error.interceptor';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: environment.azure.clientId,
    authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
    redirectUri: environment.azure.redirectUri
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage
  }
});

// MSAL must be initialized before bootstrapping the app
msalInstance.initialize().then(() => {
  // Handle any redirect response first
  msalInstance.handleRedirectPromise().then(() => {
    bootstrapApplication(AppComponent, {
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routes),
        importProvidersFrom(
          MsalModule.forRoot(msalInstance,
            {
              interactionType: InteractionType.Redirect,
              // Include API scope so user consents at login; token is cached for later acquireTokenSilent
              authRequest: { scopes: ['user.read', ...environment.functionApp.scopes] }
            },
            {
              interactionType: InteractionType.Popup,
              // Only let the interceptor handle Graph calls.
              // Function App calls are handled manually in DocumentHubService.
              protectedResourceMap: new Map([
                ['https://graph.microsoft.com/v1.0/me', ['user.read']]
              ])
            }
          )
        ),
        { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true }
      ]
    }).catch(err => console.error(err));
  }).catch(err => console.error('Redirect error:', err));
}).catch(err => console.error('MSAL init error:', err));
