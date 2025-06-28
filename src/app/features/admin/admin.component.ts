import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, Job, DashboardStats } from '../../services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  jobs: Job[] = [];
  stats: DashboardStats | null = null;
  isLoading = true;
  error: string | null = null;
  selectedTab = 'dashboard';
  showAddJobForm = false;
  isSubmitting = false;

  // Array for tabs to avoid issues with *ngFor
  tabs = ['dashboard', 'jobs', 'users', 'settings'];

  // New job form
  newJob = {
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: '',
    requirements: ''
  };

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.currentUser = this.apiService.getCurrentUser();
    this.loadAdminData();
  }

  loadAdminData() {
    this.isLoading = true;
    this.error = null;
    
    let completedRequests = 0;
    const totalRequests = 3;
    
    const checkComplete = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        this.isLoading = false;
      }
    };

    // Load users
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        checkComplete();
      },
      error: (error) => {
        this.error = 'Failed to load users';
        console.error('Users error:', error);
        checkComplete();
      }
    });

    // Load jobs
    this.apiService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        checkComplete();
      },
      error: (error) => {
        this.error = 'Failed to load jobs';
        console.error('Jobs error:', error);
        checkComplete();
      }
    });

    // Load dashboard stats
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        checkComplete();
      },
      error: (error) => {
        this.error = 'Failed to load dashboard stats';
        console.error('Stats error:', error);
        checkComplete();
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
        },
        error: (error) => {
          this.error = 'Failed to delete user';
          console.error('Delete user error:', error);
        }
      });
    }
  }

  refreshData() {
    this.loadAdminData();
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.showAddJobForm = false;
    this.cdr.detectChanges();
  }

  trackByTab(index: number, tab: string): string {
    return tab;
  }

  toggleAddJobForm() {
    this.showAddJobForm = !this.showAddJobForm;
    if (!this.showAddJobForm) {
      this.resetJobForm();
    }
  }

  submitJob() {
    if (this.newJob.title.trim() && this.newJob.description.trim()) {
      this.isSubmitting = true;
      
      const jobData: Partial<Job> = {
        title: this.newJob.title,
        department: this.newJob.department,
        location: this.newJob.location,
        type: this.newJob.type,
        description: this.newJob.description,
        requirements: this.newJob.requirements.split('\n').filter(req => req.trim())
      };

      this.apiService.createJob(jobData).subscribe({
        next: (newJob) => {
          this.jobs.unshift(newJob);
          this.resetJobForm();
          this.showAddJobForm = false;
          this.isSubmitting = false;
          this.loadAdminData(); // Refresh all data
        },
        error: (error) => {
          this.error = 'Failed to create job listing';
          this.isSubmitting = false;
          console.error('Submit job error:', error);
        }
      });
    }
  }

  resetJobForm() {
    this.newJob = {
      title: '',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: '',
      requirements: ''
    };
  }

  deleteJob(jobId: number) {
    if (confirm('Are you sure you want to delete this job listing?')) {
      // For now, just remove from local array (API endpoint would be needed)
      this.jobs = this.jobs.filter(j => j.id !== jobId);
    }
  }

  toggleUserStatus(user: User) {
    // Toggle user status (would need API endpoint)
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  }
}
