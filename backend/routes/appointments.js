const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { sendWhatsApp } = require('../twilioClient');

// GET /api/appointments — list all appointments
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/appointments — create new appointment
router.post('/', async (req, res) => {
  const { customer_name, phone_number, appointment_time } = req.body;

  // Basic validation
  if (!customer_name || !phone_number || !appointment_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Save to Supabase
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ customer_name, phone_number, appointment_time, reminder_sent: false }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Send confirmation WhatsApp/SMS
  const formattedTime = new Date(appointment_time).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const confirmationMessage =
    `Hello ${customer_name}! ✅ Your appointment has been confirmed for ${formattedTime}. ` +
    `We will send you a reminder 1 hour before. Reply STOP to opt out.`;

  try {
    await sendWhatsApp(phone_number, confirmationMessage);
  } catch (msgError) {
    console.error('[Message Error]', msgError.message);
    // Don't fail the whole request if messaging fails — appointment is saved
  }

  res.status(201).json(data);
});

// DELETE /api/appointments/:id — cancel appointment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;