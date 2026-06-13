import AppLayout from '../components/AppLayout';
import Toggle from '../components/Toggle';
import { USER_AVATAR } from '../constants/images';

export default function Profile() {
  return (
    <AppLayout
      active="profile"
      wrapperClassName="min-h-screen pb-32 bg-background"
      mainClassName="pt-24 px-container-margin md:px-0 max-w-[1040px] mx-auto w-full md:pl-28"
    >
      <section className="flex flex-col items-center mb-xl text-center">
        <img className="w-24 h-24 rounded-full border-4 shadow-md mb-4" src={USER_AVATAR} alt="Profile" />
        <h2 className="text-2xl font-bold">Profile</h2>
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
                  <p className="text-xs text-outline">Disconnected</p>
                </div>
              </div>
              <button className="text-xs uppercase bg-primary-container rounded-full px-4 py-1">Connect</button>
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
    </AppLayout>
  );
}
