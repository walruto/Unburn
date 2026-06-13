import { useNavigate } from 'react-router-dom';
import { ONBOARDING_IMAGE } from '../constants/images';
import MaterialIcon from '../components/MaterialIcon';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased overflow-x-hidden flex flex-col items-center justify-center relative">
      <main className="w-full max-w-[1040px] px-container-margin py-xl flex flex-col md:flex-row items-center justify-between gap-lg mx-auto min-h-screen relative z-10">
        <div className="w-full md:w-1/2 flex items-center justify-center mb-md md:mb-0 relative">
          <div className="relative w-full max-w-[400px] aspect-square rounded-full overflow-hidden shadow-[0_10px_30px_rgba(243,154,86,0.08)] bg-surface-container-lowest border border-surface-variant flex items-center justify-center p-md">
            <img
              alt="Meditation"
              className="w-full h-full object-cover rounded-full mix-blend-multiply opacity-90"
              src={ONBOARDING_IMAGE}
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-lg text-primary">
            <MaterialIcon name="spa" filled className="text-3xl" />
            <span className="font-headline-md text-headline-md tracking-tight">Unburn</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-on-surface mb-sm tracking-tight">Find your balance.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[480px] mb-lg">
            Unburn helps you listen to your body and prevent burnout before it happens. Your data stays private and secure.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto min-h-[56px] px-8 rounded-full bg-secondary-container text-on-secondary-container font-headline-md text-[18px] squishy-btn flex items-center justify-center gap-2"
          >
            Get Started
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
}
