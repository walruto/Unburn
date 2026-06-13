import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Toggle from '../components/Toggle';
import { USER_AVATAR } from '../constants/images';
import useAuth from '../hooks/useAuth';
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getGoogleCalendarConnection,
} from '../services/googleCalendar';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState(() => getGoogleCalendarConnection(user?.id));
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setError('');
    setLoading(true);

    try {
      await signOut();
      navigate('/');
    } catch (err) {
      setError(err.message ?? 'Unable to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    setError('');
    setCalendarLoading(true);

    try {
      await connectGoogleCalendar(user?.id);
      setCalendarStatus(getGoogleCalendarConnection(user?.id));
    } catch (err) {
      setError(err.message ?? 'Unable to connect Google Calendar. Please try again.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = () => {
    setError('');
    disconnectGoogleCalendar(user?.id);
    setCalendarStatus(getGoogleCalendarConnection(user?.id));
  };

  const calendarStatusLabel = calendarStatus.connected
    ? 'Connected'
    : calendarStatus.expired
      ? 'Expired'
      : 'Disconnected';
  const calendarStatusClassName = calendarStatus.connected
    ? 'text-secondary'
    : calendarStatus.expired
      ? 'text-error'
      : 'text-outline';

  return (
    <AppLayout
      active="profile"
      wrapperClassName="min-h-screen pb-32 bg-background"
      mainClassName="pt-24 px-container-margin md:px-0 max-w-[1040px] mx-auto w-full md:pl-28"
    >
      <section className="flex flex-col items-center mb-xl text-center">
        <img className="w-24 h-24 rounded-full border-4 shadow-md mb-4" src={USER_AVATAR} alt="Profile" />
        <h2 className="text-2xl font-bold">Profile</h2>
        {user?.email && <p className="text-sm text-on-surface-variant mt-1">{user.email}</p>}
        <p className="text-sm text-on-surface-variant">Manage how Unburn works for you.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border rounded-xl p-6">
          <h3 className="font-bold mb-4">Connections</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">favorite</span>
                <div>
                  <p className="font-bold">Apple Health</p>
                  <p className="text-xs text-secondary">Connected</p>
                </div>
              </div>
              <button className="text-xs uppercase border rounded-full px-4 py-1">Manage</button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">calendar_today</span>
                <div>
                  <p className="font-bold">Google Calendar</p>
                  <p className={`text-xs ${calendarStatusClassName}`}>{calendarStatusLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {calendarStatus.connected && (
                  <button
                    onClick={handleDisconnectCalendar}
                    className="text-xs uppercase border rounded-full px-4 py-1"
                  >
                    Disconnect
                  </button>
                )}
                <button
                  onClick={handleConnectCalendar}
                  disabled={calendarLoading}
                  className="text-xs uppercase bg-primary-container rounded-full px-4 py-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {calendarLoading
                    ? 'Connecting...'
                    : calendarStatus.connected
                      ? 'Reconnect'
                      : 'Connect Calendar'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border rounded-xl p-6">
          <h3 className="font-bold mb-4">Boundaries</h3>
          <div className="space-y-4">
            {['Gentle Nudges', 'Quiet Hours (8PM-8AM)'].map((label, i) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm font-bold">{label}</span>
                <Toggle id={`p-toggle-${i}`} defaultChecked />
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="mt-xl flex flex-col items-center gap-sm">
        {error && (
          <p className="text-sm text-error bg-error-container px-4 py-3 rounded-xl w-full max-w-md text-center" role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="squishy-btn min-h-[56px] min-w-[200px] px-8 py-4 rounded-full border-2 border-surface-variant text-on-surface font-headline-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging out...' : 'Log Out'}
        </button>
      </section>
    </AppLayout>
  );
}
