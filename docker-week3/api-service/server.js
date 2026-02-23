const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (required for Docker HEALTHCHECK)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'api-service',
    version: '1.0.0',
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Service is running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      users: 'GET /api/users',
      userById: 'GET /api/users/:id',
      root: 'GET /'
    }
  });
});

// Sample data (in production, this would be a database)
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'DevOps' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'QA Engineer' }
];

// Get all users
app.get('/api/users', (req, res) => {
  res.json({
    total: users.length,
    users: users
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ 
      error: 'User not found',
      userId: userId
    });
  }
});

// Create new user (POST example)
app.post('/api/users', (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: role || 'User'
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================`);
  console.log(`API Service started successfully`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`======================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
