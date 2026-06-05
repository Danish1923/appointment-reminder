const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN                     
);

/**
 * Send a WhatsApp message via Twilio.
 * Falls back gracefully if credentials are missing (dev/demo mode).
 */
async function sendWhatsApp(toNumber, messageBody) {
  const from = process.env.TWILIO_WHATSAPP_FROM;

  // Format: whatsapp:+1234567890
  const to = toNumber.startsWith('whatsapp:')
    ? toNumber
    : `whatsapp:${toNumber}`;

  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    // SIMULATED SEND — replace with real Twilio call in production
    console.log('[SIMULATED WhatsApp]', { from, to, body: messageBody });
    return { simulated: true, to, body: messageBody };
  }

  // REAL SEND
  const message = await client.messages.create({
    from,
    to,
    body: messageBody,
  });

  console.log(`[WhatsApp Sent] SID: ${message.sid} → ${to}`);
  return message;
}

module.exports = { sendWhatsApp };