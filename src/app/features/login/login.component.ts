import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private router: Router, private apiService: ApiService) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          // Preload data before navigation for better UX
          this.apiService.preloadData();
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Try admin/admin123 or user/user123';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getDummyCredentials() {
    return [
      { username: 'admin', password: 'admin123', role: 'Admin' },
      { username: 'user', password: 'user123', role: 'User' }
    ];
  }
}
