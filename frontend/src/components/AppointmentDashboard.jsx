import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function AppointmentDashboard({ refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/appointments`);
      console.log('Fetched appointments:', res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  async function handleDelete(id) {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await axios.delete(`${API_URL}/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete appointment.');
    }
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return (
    <div className="card dashboard">
      <h2>
        📋 All Appointments
        <button className="refresh-btn" onClick={fetchAppointments}>
          ↻ Refresh
        </button>
      </h2>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-msg">No appointments yet. Book one above!</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Appointment Time</th>
                <th>Reminder</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.customer_name}</td>
                  <td>{appt.phone_number}</td>
                  <td>{formatTime(appt.appointment_time)}</td>
                  <td>
                    <span className={`badge ${appt.reminder_sent ? 'sent' : 'pending'}`}>
                      {appt.reminder_sent ? 'Sent' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(appt.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}