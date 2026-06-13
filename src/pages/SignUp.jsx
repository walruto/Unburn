import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';
import useAuth from '../hooks/useAuth';

const inputClassName =
  'w-full min-h-[56px] px-6 border-2 border-surface-variant rounded-full text-on-surface font-body-md bg-transparent focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none';

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn } = useAuth();

  const [mode, setMode] = useState(location.state?.mode === 'login' ? 'login' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/home');
      } else {
        const data = await signUp(email, password);

        if (data.session) {
          navigate('/home');
        } else {
          setMessage('Check your email to confirm your account, then log in.');
          setMode('login');
        }
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-container-margin">
      <main className="w-full max-w-[480px] flex flex-col gap-xl">
        <header className="text-center space-y-sm">
          <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Unburn</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface">{isLogin ? 'Log In' : 'Sign Up'}</h1>
        </header>
        <section className="bg-surface-container-lowest border border-surface-variant rounded-lg p-container-margin md:p-lg soft-shadow flex flex-col gap-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
            <input
              type="password"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
            {error && (
              <p className="text-sm text-error bg-error-container px-4 py-3 rounded-xl" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-on-secondary-container bg-secondary-fixed px-4 py-3 rounded-xl" role="status">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[56px] flex items-center justify-center gap-sm bg-primary-container text-on-primary-container font-headline-md rounded-full squishy-interaction disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? 'signup' : 'login')}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-variant" />
            <span className="text-on-surface-variant text-sm">or</span>
            <div className="flex-1 h-px bg-surface-variant" />
          </div>

          <div className="flex flex-col gap-sm">
            <button
              type="button"
              onClick={() => setError('Social sign-in is not configured yet. Use email and password.')}
              className="w-full min-h-[56px] flex items-center justify-center gap-sm border-2 border-surface-variant rounded-full text-on-surface font-body-md hover:bg-surface squishy-interaction"
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => setError('Social sign-in is not configured yet. Use email and password.')}
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
