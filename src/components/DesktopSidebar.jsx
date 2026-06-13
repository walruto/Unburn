import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home', icon: 'home', path: '/home' },
  { id: 'explore', icon: 'search', path: '/insights' },
  { id: 'journey', icon: 'auto_graph', path: '/trends' },
  { id: 'profile', icon: 'person', path: '/profile' },
];

export default function DesktopSidebar({ active }) {
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-full w-[80px] flex-col items-center py-md bg-surface border-r border-surface-container-low z-30 pt-24 gap-lg">
      {NAV_ITEMS.map(({ id, icon, path }) => (
        <button
          key={id}
          onClick={() => navigate(path)}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors squish-btn ${
            active === id
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: active === id ? "'FILL' 1" : "'FILL' 0" }}
          >
            {icon}
          </span>
        </button>
      ))}
    </div>
  );
}
