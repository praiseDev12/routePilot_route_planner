import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [email, setEmail] = useState('dispatcher@routepilot.test');
  const [password, setPassword] = useState('routepilot');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (session) {
    return <Navigate to='/' replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : 'Unable to login.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#f6f8fb] p-6'>
      <section className='grid w-full max-w-5xl shadow-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel md:grid-cols-[1fr_420px]'>
        <div className='relative flex min-h-130 flex-col justify-between p-10 text-white bg-[url("../../public/images/map.png")] bg-cover'>
          <div className='absolute bg-black/80 backdrop-blur-xs inset-0 z-0' />
          <div className='z-10'>
            <p className='text-sm font-semibold uppercase tracking-wide text-blue-100'>
              Route <span className='text-yellow-500'>Pilot</span>
            </p>
            <h1 className='mt-5 max-w-lg text-4xl font-bold leading-tight'>
              Dispatch planning with real road intelligence.
            </h1>
          </div>
          <div className='grid gap-3 text-sm text-blue-50 z-10'>
            <p>Live browser geolocation.</p>
            <p>OSRM road-following route geometry.</p>
            <p>Leaflet operations dashboard for pickup and dropoff planning.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className='flex flex-col justify-center p-8'
        >
          <h2 className='text-2xl font-bold text-ink'>Sign in</h2>
          <p className='mt-2 text-sm text-slate-500'>
            Use any email and password to start a planning session.
          </p>

          <label className='mt-8 text-sm font-semibold text-slate-700'>
            Email
          </label>
          <div className='mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'>
            <Mail size={18} className='text-slate-400' />
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className='min-w-0 flex-1 bg-transparent text-sm outline-none'
            />
          </div>

          <label className='mt-4 text-sm font-semibold text-slate-700'>
            Password
          </label>
          <div className='mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'>
            <LockKeyhole size={18} className='text-slate-400' />
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className='min-w-0 flex-1 bg-transparent text-sm outline-none'
            />
          </div>

          {error ? (
            <p className='mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700'>
              {error}
            </p>
          ) : null}

          <button
            type='submit'
            disabled={loading}
            className='mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-500 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading ? 'Signing in...' : 'Open dashboard'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}
