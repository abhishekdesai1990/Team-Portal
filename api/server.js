const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory path
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Helper function to read JSON file
const readJsonFile = async (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`File ${filename} not found, returning empty array`);
    return [];
  }
};

// Helper function to write JSON file
const writeJsonFile = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Initialize data files
const initializeData = async () => {
  await ensureDataDir();
  
  // Initialize users if not exists
  const users = await readJsonFile('users.json');
  if (users.length === 0) {
    const defaultUsers = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@company.com' },
      { id: 2, username: 'user', password: 'user123', role: 'user', email: 'user@company.com' },
      { id: 3, username: 'john.doe', password: 'john123', role: 'user', email: 'john.doe@company.com' },
      { id: 4, username: 'jane.smith', password: 'jane123', role: 'user', email: 'jane.smith@company.com' }
    ];
    await writeJsonFile('users.json', defaultUsers);
  }

  // Initialize jobs if not exists
  const jobs = await readJsonFile('jobs.json');
  if (jobs.length === 0) {
    const defaultJobs = [
      {
        id: 1,
        title: 'Senior Angular Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'We are looking for an experienced Angular developer to join our team.',
        requirements: ['5+ years Angular experience', 'TypeScript proficiency', 'REST API integration'],
        postedDate: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 2,
        title: 'DevOps Engineer',
        department: 'Engineering',
        location: 'New York',
        type: 'Full-time',
        description: 'Join our DevOps team to help scale our infrastructure.',
        requirements: ['Docker/Kubernetes', 'AWS/Azure', 'CI/CD pipelines'],
        postedDate: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 3,
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco',
        type: 'Full-time',
        description: 'Lead product strategy and roadmap development.',
        requirements: ['Product management experience', 'Agile methodologies', 'Stakeholder management'],
        postedDate: new Date().toISOString(),
        status: 'active'
      }
    ];
    await writeJsonFile('jobs.json', defaultJobs);
  }

  // Initialize suggestions if not exists
  const suggestions = await readJsonFile('suggestions.json');
  if (suggestions.length === 0) {
    const defaultSuggestions = [
      {
        id: 1,
        title: 'Improve Code Review Process',
        description: 'We should implement automated code review tools to speed up the process and catch common issues.',
        category: 'Process',
        submittedBy: 'John Doe',
        submittedAt: new Date('2024-01-15').toISOString(),
        status: 'pending',
        votes: 12
      },
      {
        id: 2,
        title: 'Remote Work Equipment Budget',
        description: 'Increase the budget for home office equipment to improve remote work productivity.',
        category: 'Benefits',
        submittedBy: 'Jane Smith',
        submittedAt: new Date('2024-01-12').toISOString(),
        status: 'approved',
        votes: 25
      },
      {
        id: 3,
        title: 'Flexible Working Hours',
        description: 'Allow more flexible working hours to accommodate different time zones and personal schedules.',
        category: 'Policy',
        submittedBy: 'Mike Johnson',
        submittedAt: new Date('2024-01-10').toISOString(),
        status: 'pending',
        votes: 18
      }
    ];
    await writeJsonFile('suggestions.json', defaultSuggestions);
  }
};

// API Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJsonFile('users.json');
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: 'Login successful' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Users Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJsonFile('users.json', users);
    
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const userId = parseInt(req.params.id);
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await writeJsonFile('users.json', filteredUsers);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Jobs Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await readJsonFile('jobs.json');
    const { search, department, location, type } = req.query;
    
    let filteredJobs = jobs.filter(job => job.status === 'active');
    
    if (search) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (department && department !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.department === department);
    }
    
    if (location && location !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.location === location);
    }
    
    if (type && type !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }
    
    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const jobs = await readJsonFile('jobs.json');
    const newJob = {
      id: Math.max(...jobs.map(j => j.id), 0) + 1,
      ...req.body,
      postedDate: new Date().toISOString(),
      status: 'active'
    };
    
    jobs.push(newJob);
    await writeJsonFile('jobs.json', jobs);
    
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Suggestions Routes
app.get('/api/suggestions', async (req, res) => {
  try {
    const suggestions = await readJsonFile('suggestions.json');
    const { category } = req.query;
    
    let filteredSuggestions = suggestions;
    
    if (category && category !== 'all') {
      filteredSuggestions = suggestions.filter(s => s.category === category);
    }
    
    res.json(filteredSuggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

app.post('/api/suggestions', async (req, res) => {
  try {
    const suggestions = await readJsonFile('suggestions.json');
    const newSuggestion = {
      id: Math.max(...suggestions.map(s => s.id), 0) + 1,
      ...req.body,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      votes: 0
    };
    
    suggestions.push(newSuggestion);
    await writeJsonFile('suggestions.json', suggestions);
    
    res.status(201).json(newSuggestion);
  } catch (error) {
    res.status(500).json({ message: 'Error creating suggestion' });
  }
});

app.put('/api/suggestions/:id/vote', async (req, res) => {
  try {
    const suggestions = await readJsonFile('suggestions.json');
    const suggestionId = parseInt(req.params.id);
    
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }
    
    suggestion.votes += 1;
    await writeJsonFile('suggestions.json', suggestions);
    
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Error voting on suggestion' });
  }
});

app.put('/api/suggestions/:id/status', async (req, res) => {
  try {
    const suggestions = await readJsonFile('suggestions.json');
    const suggestionId = parseInt(req.params.id);
    const { status } = req.body;
    
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }
    
    suggestion.status = status;
    await writeJsonFile('suggestions.json', suggestions);
    
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Error updating suggestion status' });
  }
});

// Dashboard/Stats Routes
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const jobs = await readJsonFile('jobs.json');
    const suggestions = await readJsonFile('suggestions.json');
    
    // Calculate recent jobs (jobs posted in the last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const recentJobs = jobs.filter(job => {
      const postedDate = new Date(job.postedDate);
      return postedDate >= sevenDaysAgo;
    });
    
    const stats = {
      totalUsers: users.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      totalJobs: jobs.length,
      pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
      totalSuggestions: suggestions.length,
      recentJobsCount: recentJobs.length,
      recentActivity: [
        {
          time: '10:30 AM',
          text: `New user registration: ${users[users.length - 1]?.email || 'john.doe@company.com'}`
        },
        {
          time: '09:15 AM',
          text: `Job posting created: ${jobs[jobs.length - 1]?.title || 'Senior Angular Developer'}`
        },
        {
          time: '08:45 AM',
          text: 'System backup completed successfully'
        },
        {
          time: '08:30 AM',
          text: `User role updated: ${users[1]?.email || 'jane.smith@company.com'}`
        }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'TeamPortal API is running' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Initialize and start server
const startServer = async () => {
  try {
    await initializeData();
    app.listen(PORT, () => {
      console.log(`TeamPortal API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export the app for testing
module.exports = app;
