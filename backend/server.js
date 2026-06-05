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
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE'],
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/appointments', appointmentsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderJob(); // Start the 1-hour reminder cron
});