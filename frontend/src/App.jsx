import { useState } from 'react';
import AppointmentForm from './components/AppointmentForm';
import AppointmentDashboard from './components/AppointmentDashboard';

export default function App() {
  // Incrementing this key forces the dashboard to re-fetch
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNewAppointment() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="container">
      <header>
        <h1>📱 Appointment Reminder System</h1>
        <p>Book appointments and send automatic WhatsApp confirmations & reminders</p>
      </header>

      <AppointmentForm onCreated={handleNewAppointment} />
      <AppointmentDashboard refreshKey={refreshKey} />
    </div>
  );
}