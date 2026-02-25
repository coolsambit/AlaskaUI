import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AccountInfo } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- Login screen: shown when not authenticated -->
    <div *ngIf="!isLoggedIn && msalReady" class="login-screen">
      <div class="login-card">
        <h1>Document Hub</h1>
        <p>Sign in with your organization account to continue.</p>
        <button (click)="login()" class="sign-in-btn">Sign in with Microsoft</button>
      </div>
    </div>

    <!-- Loading: shown while MSAL is initializing -->
    <div *ngIf="!msalReady" class="login-screen">
      <div class="login-card">
        <h1>Document Hub</h1>
        <p>Loading...</p>
      </div>
    </div>

    <!-- App content: shown only when authenticated -->
    <div *ngIf="isLoggedIn" class="container">
      <nav>
        <a routerLink="/upload">Upload</a>
        <a routerLink="/search">Search</a>
        <a routerLink="/viewer">Viewer</a>
        <div class="auth-section">
          <div class="user-dropdown">
            <button class="user-btn" (click)="toggleDropdown()">{{ displayName }} &#9662;</button>
            <div *ngIf="dropdownOpen" class="dropdown-menu">
              <button (click)="logout()">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .login-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .login-card {
      background: white;
      padding: 40px 50px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      text-align: center;
      max-width: 400px;
    }
    .login-card h1 {
      color: #007acc;
      margin-bottom: 12px;
    }
    .login-card p {
      color: #555;
      margin-bottom: 24px;
    }
    .sign-in-btn {
      background: #007acc;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
    }
    .sign-in-btn:hover {
      background: #005fa3;
    }
    :host ::ng-deep nav {
      display: flex;
      align-items: center;
    }
    .auth-section {
      margin-left: auto;
      position: relative;
    }
    .user-btn {
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    .user-btn:hover {
      background: rgba(255,255,255,0.15);
    }
    .dropdown-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 100;
      min-width: 120px;
    }
    .dropdown-menu button {
      display: block;
      width: 100%;
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      text-align: left;
      color: #333;
    }
    .dropdown-menu button:hover {
      background: #f0f0f0;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  msalReady = false;
  displayName = '';
  dropdownOpen = false;
  private readonly destroying$ = new Subject<void>();

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    // MSAL is already initialized in main.ts before bootstrap, safe to check directly
    this.checkAccount();

    // Also listen for future MSAL interaction changes
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.checkAccount();
      });
  }

  checkAccount(): void {
    try {
      this.msalReady = true;
      const accounts = this.authService.instance.getAllAccounts();
      console.log('MSAL accounts:', accounts);
      if (accounts.length > 0) {
        this.isLoggedIn = true;
        const account: AccountInfo = accounts[0];
        this.displayName = account.name || account.username || 'User';
        console.log('Logged in as:', this.displayName);
      } else {
        this.isLoggedIn = false;
        this.displayName = '';
        console.log('No accounts found — showing login screen');
      }
    } catch (e) {
      console.error('checkAccount error:', e);
      this.msalReady = true;
    }
  }

  login(): void {
    this.authService.loginRedirect({ scopes: ['user.read'] });
  }

  logout(): void {
    this.authService.logoutRedirect();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
