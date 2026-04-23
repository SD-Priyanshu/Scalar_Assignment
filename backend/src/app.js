// Main Express Application
const express = require('express');
const cors = require('cors');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cardRoutes');
const labelRoutes = require('./routes/labelRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const cardSearchRoutes = require('./routes/cardSearchRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000', // Next.js local
  'http://localhost:5173', // Vite (just in case)
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Board routes ──────────────────────────────────────────────
app.use('/api/boards', boardRoutes);

// ── List routes ───────────────────────────────────────────────
// Nested under board AND standalone
app.use('/api/boards/:boardId/lists', listRoutes);
app.use('/api/lists', listRoutes);

// ── Search & filter routes (MUST come before /api/cards to avoid conflicts) ──
// Routes are mounted at /api to match API spec
app.use('/api', cardSearchRoutes);

// ── Card routes ───────────────────────────────────────────────
// Nested under list AND standalone
app.use('/api/boards/:boardId/lists/:listId/cards', cardRoutes);
app.use('/api/lists/:listId/cards', cardRoutes);
app.use('/api/cards', cardRoutes);

// ── Checklist routes ──────────────────────────────────────────
app.use('/api/cards/:cardId/checklist', checklistRoutes);
app.use('/api/checklist', checklistRoutes);

// ── Label routes ──────────────────────────────────────────────
app.use('/api/labels', labelRoutes);
app.use('/api/cards/:cardId/labels', labelRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;