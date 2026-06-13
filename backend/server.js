require('dotenv').config();

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const key of required) {
  if (!process.env[key] || process.env[key].startsWith('your_')) {
    console.error(`❌ Missing or placeholder env var: ${key}`);
    process.exit(1);
  }
}

console.log('✅ Supabase URL:', process.env.SUPABASE_URL);

const express = require('express');
const cors = require('cors');
const appointmentsRouter = require('./routes/appointments');
const { startReminderJob } = require('./cron/reminderJob');

const app = express();
const PORT = process.env.PORT || 4000;

// Handle CORS — allow any origin for now to rule out CORS as the issue
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'Appointment Reminder API' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/appointments', appointmentsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderJob();
});

// Keep Render free tier awake
setInterval(() => {
  fetch(`https://appointment-reminder-backend-p14l.onrender.com/health`)
    .then(() => console.log('[KeepAlive] pinged'))
    .catch(() => console.log('[KeepAlive] ping failed'));
}, 10 * 60 * 1000); // every 10 minutes