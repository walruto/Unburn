import { useNavigate } from 'react-router-dom';
import { USER_AVATAR } from '../constants/images';

const WORKLOADS = ['bg-workload-low', 'bg-workload-mod', 'bg-surface-container-low', 'bg-workload-busy', 'bg-workload-high'];

export default function Calendar() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-body-md overflow-x-hidden pb-32 bg-background">
      <header className="px-container-margin py-md flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur z-40">
        <button
          onClick={() => navigate(-1)}
          className="squish-click w-12 h-12 flex items-center justify-center rounded-full bg-surface-container"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold">June</h1>
        <button onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full overflow-hidden border-2">
          <img src={USER_AVATAR} className="w-full h-full object-cover" alt="Profile" />
        </button>
      </header>
      <main className="max-w-[1040px] mx-auto px-container-margin mt-sm flex flex-col xl:flex-row gap-lg">
        <section className="flex-1">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase opacity-70 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 auto-rows-[60px] md:auto-rows-[80px]">
            {[...Array(4)].map((_, i) => (
              <div key={`empty-${i}`} className="opacity-30" />
            ))}
            {[...Array(26)].map((_, i) => {
              const day = i + 1;
              const workload = WORKLOADS[Math.floor(Math.random() * WORKLOADS.length)];
              const isSelected = day === 12;
              return (
                <button
                  key={day}
                  className={`squish-click flex flex-col items-center justify-center rounded-xl text-lg font-bold shadow-sm transition-all ${
                    isSelected
                      ? 'bg-tertiary-fixed ring-4 ring-tertiary-fixed-dim transform scale-105 z-10'
                      : workload
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>
        <section className="w-full xl:w-[400px] space-y-6">
          <div className="bg-surface-container-lowest border rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold">Wed, June 12</h2>
            <div className="mt-2 bg-workload-mod px-4 py-1.5 rounded-full inline-block text-xs font-bold">
              Burnout Risk: Moderate
            </div>
            <div className="mt-6 bg-surface-container-low p-4 rounded-xl text-sm border flex gap-3">
              <span className="material-symbols-outlined text-primary">psychiatry</span>
              <p>You have 6 hours of meetings. Consider moving a low-priority task to give yourself breathing room.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-tertiary-fixed rounded-xl border border-tertiary-fixed-dim/50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Mindful Walk</p>
                  <p className="text-xs opacity-70">12:30 PM - 1:00 PM</p>
                </div>
                <span className="material-symbols-outlined">nature_people</span>
              </div>
              <button className="w-full text-left bg-surface-container border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary-fixed rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">self_improvement</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Add 15m recovery break</p>
                </div>
                <span className="material-symbols-outlined">add_circle</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
