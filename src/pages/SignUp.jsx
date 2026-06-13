import { useNavigate } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';

export default function SignUp() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-container-margin">
      <main className="w-full max-w-[480px] flex flex-col gap-xl">
        <header className="text-center space-y-sm">
          <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Unburn</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface">Sign Up</h1>
        </header>
        <section className="bg-surface-container-lowest border border-surface-variant rounded-lg p-container-margin md:p-lg soft-shadow flex flex-col gap-md">
          <div className="flex flex-col gap-sm">
            <button
              onClick={() => navigate('/permissions')}
              className="w-full min-h-[56px] flex items-center justify-center gap-sm border-2 border-surface-variant rounded-full text-on-surface font-body-md hover:bg-surface squishy-interaction"
            >
              Continue with Google
            </button>
            <button
              onClick={() => navigate('/permissions')}
              className="w-full min-h-[56px] flex items-center justify-center gap-sm border-2 border-surface-variant rounded-full text-on-surface font-body-md hover:bg-surface squishy-interaction"
            >
              <MaterialIcon name="apps" filled />
              Continue with Apple
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
