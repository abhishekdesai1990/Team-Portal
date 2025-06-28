import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  posted: string;
  description: string;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {
  searchTerm = '';
  
  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'We are looking for a passionate Senior Frontend Developer to join our team and help build amazing user experiences.'
    },
    {
      id: 2,
      title: 'UX Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our design team to create intuitive and beautiful user interfaces for our applications.'
    },
    {
      id: 3,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'San Francisco, CA',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Help us grow our brand and reach new customers through innovative marketing strategies.'
    },
    {
      id: 4,
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'Full-time',
      posted: '5 days ago',
      description: 'Build scalable and robust backend systems to support our growing platform.'
    }
  ];
}
