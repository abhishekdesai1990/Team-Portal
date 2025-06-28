import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Suggestion } from '../../services/api.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit {
  suggestions: Suggestion[] = [];
  isLoading = true;
  error: string | null = null;
  isSubmitting = false;

  newSuggestion = {
    title: '',
    description: '',
    category: 'Process'
  };

  categories = ['Process', 'Benefits', 'Policy', 'Technology', 'Other'];
  selectedCategory = 'all';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSuggestions();
  }

  get filteredSuggestions() {
    if (this.selectedCategory === 'all') {
      return this.suggestions;
    }
    return this.suggestions.filter(s => s.category === this.selectedCategory);
  }

  loadSuggestions() {
    this.isLoading = true;
    this.error = null;

    this.apiService.getSuggestions(this.selectedCategory).subscribe({
      next: (suggestions) => {
        this.suggestions = suggestions;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load suggestions';
        this.isLoading = false;
        console.error('Suggestions error:', error);
      }
    });
  }

  submitSuggestion() {
    if (this.newSuggestion.title.trim() && this.newSuggestion.description.trim()) {
      this.isSubmitting = true;
      
      const suggestionData = {
        ...this.newSuggestion,
        submittedBy: this.apiService.getCurrentUser()?.username || 'Current User'
      };

      this.apiService.createSuggestion(suggestionData).subscribe({
        next: (newSuggestion) => {
          this.suggestions.unshift(newSuggestion);
          this.newSuggestion = {
            title: '',
            description: '',
            category: 'Process'
          };
          this.isSubmitting = false;
        },
        error: (error) => {
          this.error = 'Failed to submit suggestion';
          this.isSubmitting = false;
          console.error('Submit error:', error);
        }
      });
    }
  }

  voteSuggestion(suggestion: Suggestion) {
    if (suggestion.id) {
      this.apiService.voteSuggestion(suggestion.id).subscribe({
        next: (updatedSuggestion) => {
          const index = this.suggestions.findIndex(s => s.id === suggestion.id);
          if (index !== -1) {
            this.suggestions[index] = updatedSuggestion;
          }
        },
        error: (error) => {
          console.error('Vote error:', error);
        }
      });
    }
  }

  filterByCategory() {
    this.loadSuggestions();
  }

  refreshSuggestions() {
    this.loadSuggestions();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#ffc107';
    }
  }
}
