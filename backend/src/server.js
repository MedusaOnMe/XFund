require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeFirebase } = require('./config/firebase');
const apiRoutes = require('./routes/api');
const { startPoller } = require('./services/poller');
const { startExpiryService } = require('./services/expiry');

/**
 * XFunder Server - ALL IN ONE
 * Backend API + Frontend + Background Workers
 * Deploy as single service to Railway
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase:', error.message);
  process.exit(1);
}

// API routes (must come before static files)
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// Serve Next.js frontend (built static files)
const frontendBuildPath = path.join(__dirname, '../../frontend/out');
app.use(express.static(frontendBuildPath));

// Fallback for Next.js client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 XFunder Server listening on port ${PORT}`);
  console.log(`Frontend: Serving from /frontend/out`);
  console.log(`API: /api/*`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Solana Network: ${process.env.HELIUS_RPC_URL ? 'Mainnet' : 'Not configured'}`);
  console.log(`Twitter Handle: @${process.env.TWITTER_HANDLE || 'crowdfund'}\n`);

  // Start background services (tweet poller + expiry timer)
  startPoller();
  startExpiryService();

  console.log('✅ Backend + Frontend + Workers all running\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
