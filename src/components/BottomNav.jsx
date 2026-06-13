import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', path: '/home' },
  { id: 'explore', label: 'Explore', icon: 'search', path: '/insights' },
  { id: 'journey', label: 'Journey', icon: 'auto_graph', path: '/trends' },
  { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
];

export default function BottomNav({ active }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 w-full rounded-t-xl z-50 bg-surface shadow-[0_-10px_30px_rgba(243,154,86,0.08)] md:hidden">
      <div className="flex justify-around items-center px-4 pb-4 pt-2">
        {NAV_ITEMS.map(({ id, label, icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center px-sm py-xs squish-btn ${
              active === id
                ? 'bg-primary-container text-on-primary-container rounded-xl'
                : 'text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={{ fontVariationSettings: active === id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            <span className="font-label-caps text-[10px] uppercase">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
