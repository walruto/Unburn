import { USER_AVATAR } from '../constants/images';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-container-margin py-xs max-w-7xl mx-auto">
        <div className="flex items-center gap-xs cursor-pointer group">
          <img
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-surface-container-high group-hover:border-primary-container transition-colors"
            src={USER_AVATAR}
          />
        </div>
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Unburn</h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors squish-btn">
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>
      </div>
    </header>
  );
}
