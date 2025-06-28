import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Job } from '../../services/api.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  isLoading = true;
  error: string | null = null;
  isSubmitting = false;
  showAddJobForm = false;

  // Filter properties
  searchTerm = '';
  selectedDepartment = 'all';
  selectedLocation = 'all';
  selectedType = 'all';

  // Filter options
  departments: string[] = [];
  locations: string[] = [];
  types: string[] = [];

  // New job form
  newJob = {
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: '',
    requirements: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.isLoading = true;
    this.error = null;

    this.apiService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.populateFilterOptions();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load jobs data';
        this.isLoading = false;
        console.error('Jobs error:', error);
      }
    });
  }

  populateFilterOptions() {
    this.departments = [...new Set(this.jobs.map(job => job.department))];
    this.locations = [...new Set(this.jobs.map(job => job.location))];
    this.types = [...new Set(this.jobs.map(job => job.type))];
  }

  applyFilters() {
    const filters = {
      search: this.searchTerm,
      department: this.selectedDepartment,
      location: this.selectedLocation,
      type: this.selectedType
    };

    this.isLoading = true;
    this.apiService.getJobs(filters).subscribe({
      next: (jobs) => {
        this.filteredJobs = jobs;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to filter jobs';
        this.isLoading = false;
        console.error('Filter error:', error);
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = 'all';
    this.selectedLocation = 'all';
    this.selectedType = 'all';
    this.loadJobs();
  }

  refreshJobs() {
    this.loadJobs();
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
          this.applyFilters(); // Refresh the filtered list
          this.resetJobForm();
          this.showAddJobForm = false;
          this.isSubmitting = false;
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

  isAdmin(): boolean {
    return this.apiService.isAdmin();
  }
}
