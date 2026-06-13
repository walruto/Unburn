import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOODS = ['😫', '😕', '😐', '🙂', '🤩'];

export default function CheckIn() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(2);

  return (
    <div className="min-h-screen flex flex-col items-center pb-24 bg-background">
      <header className="w-full max-w-4xl px-container-margin py-sm flex justify-between items-center bg-background/80 backdrop-blur-sm z-40">
        <div className="font-headline-md text-headline-md text-primary tracking-tight">Unburn</div>
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>
      <main className="flex-1 w-full max-w-2xl px-container-margin mt-lg flex flex-col gap-lg">
        <div className="text-center space-y-2">
          <p className="font-label-caps text-secondary uppercase tracking-widest text-xs">Daily Check-in</p>
          <h1 className="text-3xl font-bold">How are you feeling today?</h1>
        </div>
        <div className="bg-surface-container-lowest border rounded-xl p-6 flex justify-between overflow-x-auto no-scrollbar gap-2">
          {MOODS.map((mood, i) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(i)}
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl transition-all ${
                selectedMood === i
                  ? 'bg-primary-container border-primary scale-110 shadow-lg'
                  : 'border-surface-variant bg-surface-container'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {['Energy Level', 'Stress Level'].map((label, i) => (
            <div key={label} className="bg-surface-container-lowest border rounded-xl p-6">
              <h3 className="font-bold">{label}</h3>
              <input className={`mt-4 ${i === 0 ? 'energy-track' : 'stress-track'}`} type="range" />
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-primary-container py-4 rounded-full font-bold shadow-md"
        >
          Save Check-in
        </button>
      </main>
    </div>
  );
}
