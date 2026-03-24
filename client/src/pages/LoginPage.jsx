import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  }, [user, navigate, location]);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen bg-sovereign-gradient flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-sovereign-gold mb-6">
            <span className="text-sovereign-gold text-lg font-bold font-display">S</span>
          </div>
          <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Sovereign Executive</p>
          <h1 className="font-display text-3xl text-sovereign-platinum">Welcome Back</h1>
          <p className="text-sovereign-muted text-sm mt-2">Authenticate to enter the command center.</p>
        </div>

        <div className="card-sovereign">
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-sovereign">Institutional Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="executive@institution.com"
                value={form.email}
                onChange={handleChange}
                className="input-sovereign"
              />
            </div>

            <div>
              <label className="label-sovereign">Secure Passkey</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                className="input-sovereign"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Authenticating...' : 'Initiate Session'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-sovereign-border" />
            <span className="text-sovereign-muted text-xs tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-sovereign-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Google', 'Apple ID'].map((provider) => (
              <button
                key={provider}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-sovereign-border
                           text-sovereign-muted text-xs tracking-wide hover:border-sovereign-gold/40
                           hover:text-sovereign-platinum transition-all duration-200 rounded-sm"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sovereign-muted text-sm mt-6">
          New to the network?{' '}
          <Link to="/signup" className="text-sovereign-gold hover:text-sovereign-gold-light transition-colors">
            Apply for Membership
          </Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-sovereign-dark border border-sovereign-border/50 rounded-sm text-center">
          <p className="text-sovereign-muted text-xs mb-1">Demo Credentials</p>
          <p className="text-sovereign-platinum text-xs">admin@sovereign.com · user@sovereign.com</p>
          <p className="text-sovereign-gold text-xs mt-0.5">Password123!</p>
        </div>
      </div>
    </div>
  );
}
