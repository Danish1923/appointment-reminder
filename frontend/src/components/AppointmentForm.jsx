import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function AppointmentForm({ onCreated }) {
  const [form, setForm] = useState({
    customer_name: '',
    phone_number: '',
    date: '',
    hour: '12',
    minute: '00',
    ampm: 'AM',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function buildISODateTime() {
    let hour = parseInt(form.hour, 10);
    if (form.ampm === 'AM' && hour === 12) hour = 0;
    if (form.ampm === 'PM' && hour !== 12) hour += 12;
    const padded = String(hour).padStart(2, '0');
    return `${form.date}T${padded}:${form.minute}:00`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (!form.date) {
      setStatus({ type: 'error', message: 'Please select a date.' });
      setLoading(false);
      return;
    }

    const appointment_time = buildISODateTime();

    try {
      await axios.post(`${API_URL}/api/appointments`, {
        customer_name: form.customer_name,
        phone_number: form.phone_number,
        appointment_time,
      });
      setStatus({
        type: 'success',
        message: `✅ Appointment saved! A confirmation WhatsApp was sent to ${form.phone_number}.`,
      });
      setForm({
        customer_name: '',
        phone_number: '',
        date: '',
        hour: '12',
        minute: '00',
        ampm: 'AM',
      });
      onCreated();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  // Generate all 60 minutes 00-59
  const allMinutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  // Generate hours 01-12
  const allHours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  return (
    <div className="card">
      <h2>📅 Book an Appointment</h2>
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="customer_name">Customer Name</label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            placeholder="e.g. Jane Smith"
            value={form.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number (WhatsApp)</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="+1234567890"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date — calendar picker only, no typing */}
        <div className="form-group">
          <label htmlFor="date">Appointment Date</label>
          <div className="calendar-wrap">
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              onKeyDown={(e) => e.preventDefault()}
              required
            />
            <span className="calendar-icon">📆</span>
          </div>
        </div>

        {/* Time — scrollable clock-style selectors */}
        <div className="form-group">
          <label>Appointment Time</label>
          <div className="clock-row">

            {/* Hour drum */}
            <div className="drum-wrap">
              <div className="drum-label">HH</div>
              <div className="drum">
                {allHours.map((h) => (
                  <div
                    key={h}
                    className={`drum-item ${form.hour === h ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, hour: h })}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            <span className="clock-sep">:</span>

            {/* Minute drum */}
            <div className="drum-wrap">
              <div className="drum-label">MM</div>
              <div className="drum">
                {allMinutes.map((m) => (
                  <div
                    key={m}
                    className={`drum-item ${form.minute === m ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, minute: m })}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* AM / PM toggle */}
            <div className="drum-wrap">
              <div className="drum-label">AM/PM</div>
              <div className="ampm-toggle">
                <div
                  className={`ampm-btn ${form.ampm === 'AM' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, ampm: 'AM' })}
                >
                  AM
                </div>
                <div
                  className={`ampm-btn ${form.ampm === 'PM' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, ampm: 'PM' })}
                >
                  PM
                </div>
              </div>
            </div>

          </div>

          {/* Selected time preview */}
          <div className="time-preview">
            🕐 Selected: {form.hour}:{form.minute} {form.ampm}
            {form.date && ` on ${new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'medium' })}`}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Book & Send Confirmation'}
        </button>
      </form>

      {status && (
        <div className={`status-msg ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}