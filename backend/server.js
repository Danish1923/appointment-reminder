require('dotenv').config(); // ← MUST be line 1, before any other require
const express = require('express');
const cors = require('cors');
const appointmentsRouter = require('./routes/appointments');
const { startReminderJob } = require('./cron/reminderJob');
// Startup validation — catch missing env vars immediately
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const key of required) {
  if (!process.env[key] || process.env[key].startsWith('your_')) {
    console.error(`❌ Missing or placeholder env var: ${key}`);
    process.exit(1);
  }
}

console.log('✅ Supabase URL:', process.env.SUPABASE_URL);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'https://appointment-reminder-roan.vercel.app',
      'http://localhost:5173',
    ];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    // Strip trailing slash before comparing
    const clean = origin.replace(/\/$/, '');
    if (allowed.includes(clean)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/appointments', appointmentsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderJob(); // Start the 1-hour reminder cron
});