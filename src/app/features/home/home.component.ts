import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DashboardStats } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  isLoading = false; // Start as false, only show loading when actually loading
  error: string | null = null;
  private subscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Check if we already have cached data
    const cachedStats = this.apiService.getCachedDashboardStats();
    if (cachedStats) {
      this.stats = cachedStats;
      this.isLoading = false;
    } else {
      this.loadDashboardStats();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.error = null;
    
    this.subscription = this.apiService.getDashboardStats().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        console.error('Dashboard error:', error);
      }
    });
  }

  refreshStats() {
    this.subscription?.unsubscribe();
    this.subscription = this.apiService.refreshDashboard().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.error = null;
      },
      error: (error) => {
        this.error = 'Failed to refresh dashboard data';
        console.error('Dashboard refresh error:', error);
      }
    });
  }
}
