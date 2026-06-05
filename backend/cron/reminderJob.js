const cron = require('node-cron');
const supabase = require('../supabaseClient');
const { sendWhatsApp } = require('../twilioClient');

async function checkAndSendReminders() {
  const now = new Date();
  const in60 = new Date(now.getTime() + 60 * 60 * 1000);

  console.log(`[Cron] Checking reminders between ${now.toISOString()} and ${in60.toISOString()}`);

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('reminder_sent', false)
    .gte('appointment_time', now.toISOString())
    .lte('appointment_time', in60.toISOString());

  if (error) {
    // Print the full error object so you can see exactly what Supabase returned
    console.error('[Cron Error] Supabase query failed:');
    console.error('  message:', error.message);
    console.error('  details:', error.details);
    console.error('  hint:', error.hint);
    console.error('  code:', error.code);
    return;
  }

  console.log(`[Cron] Found ${appointments.length} appointment(s) to remind`);

  for (const appt of appointments) {
    const formattedTime = new Date(appt.appointment_time).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const reminderMessage =
      `⏰ Reminder: Hi ${appt.customer_name}! Your appointment is at ${formattedTime}. See you soon!`;

    try {
      await sendWhatsApp(appt.phone_number, reminderMessage);

      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', appt.id);

      console.log(`[Cron] Reminder sent → ${appt.customer_name}`);
    } catch (err) {
      console.error(`[Cron] Failed to remind ${appt.customer_name}:`, err.message);
    }
  }
}

function startReminderJob() {
  cron.schedule('* * * * *', checkAndSendReminders);
  console.log('[Cron] Reminder job started — checking every minute.');
}

module.exports = { startReminderJob };