import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, User } from './services/api.service';

//explain component decorator
/**
 * The Component decorator is a crucial part of Angular's framework, allowing developers to define
 * metadata for a component. This metadata includes the component's selector, template, styles, and
 * other properties that determine how the component behaves and is rendered.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h2>{{ title }}</h2>
        </div>
        <ul class="nav-menu">
          <li class="nav-item" *ngIf="currentUser">
            <a routerLink="/home" routerLinkActive="active" class="nav-link">Dashboard</a>
          </li>
          <li class="nav-item" *ngIf="currentUser">
            <a routerLink="/jobs" routerLinkActive="active" class="nav-link">Jobs</a>
          </li>
          <li class="nav-item" *ngIf="currentUser">
            <a routerLink="/suggestions" routerLinkActive="active" class="nav-link">Suggestions</a>
          </li>
          <li class="nav-item" *ngIf="currentUser && isAdmin">
            <a routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
          </li>
        </ul>
        <div class="nav-auth">
          <span *ngIf="currentUser" class="user-info">
            Welcome, {{ currentUser.username }}
            <span class="user-role">({{ currentUser.role }})</span>
          </span>
          <button *ngIf="currentUser" (click)="logout()" class="logout-btn">Logout</button>
          <a *ngIf="!currentUser" routerLink="/login" class="nav-link">Login</a>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background-color: #2c3e50;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
    }
    .nav-auth {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-info {
      color: #ecf0f1;
      font-size: 0.9rem;
    }
    .user-role {
      color: #bdc3c7;
      font-size: 0.8rem;
    }
    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s ease;
    }
    .logout-btn:hover {
      background: #c0392b;
    }
    .nav-brand h2 {
      color: white;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .nav-menu {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.5rem;
    }
    .nav-link {
      color: #ecf0f1;
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .nav-link.active {
      background-color: #3498db;
      color: white;
    }
    .main-content {
      min-height: calc(100vh - 60px);
      background-color: #f8f9fa;
    }
  `]
})
export class App implements OnInit {
  protected title = 'TeamPortal';
  currentUser: User | null = null;
  isAdmin = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.apiService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.isAdmin = this.apiService.isAdmin();
    });
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}
