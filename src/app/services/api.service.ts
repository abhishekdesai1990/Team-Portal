import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id?: number;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  name?: string;
  status?: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface Job {
  id?: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  postedDate?: string;
  status?: string;
}

export interface Suggestion {
  id?: number;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  submittedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  totalJobs: number;
  pendingSuggestions: number;
  totalSuggestions: number;
  recentJobsCount: number;
  recentActivity: { time: string; text: string; }[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Authentication
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { username, password })
      .pipe(
        tap((response: any) => {
          if (response.success) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        })
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Jobs
  getJobs(filters?: { search?: string; department?: string; location?: string; type?: string }): Observable<Job[]> {
    let url = `${this.baseUrl}/jobs`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    return this.http.get<Job[]>(url);
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.baseUrl}/jobs`, job);
  }

  // Suggestions
  getSuggestions(category?: string): Observable<Suggestion[]> {
    let url = `${this.baseUrl}/suggestions`;
    if (category && category !== 'all') {
      url += `?category=${category}`;
    }
    return this.http.get<Suggestion[]>(url);
  }

  createSuggestion(suggestion: Partial<Suggestion>): Observable<Suggestion> {
    return this.http.post<Suggestion>(`${this.baseUrl}/suggestions`, suggestion);
  }

  voteSuggestion(id: number): Observable<Suggestion> {
    return this.http.put<Suggestion>(`${this.baseUrl}/suggestions/${id}/vote`, {});
  }

  updateSuggestionStatus(id: number, status: string): Observable<Suggestion> {
    return this.http.put<Suggestion>(`${this.baseUrl}/suggestions/${id}/status`, { status });
  }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
