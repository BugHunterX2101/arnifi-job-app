import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearAuthError } from '../store/authSlice';

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (e) => {
    setLocalError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== confirm) return setLocalError('Passkeys do not match.');
    if (form.password.length < 6) return setLocalError('Passkey must be at least 6 characters.');
    dispatch(signupUser(form));
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-sovereign-gradient flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-sovereign-gold mb-6">
            <span className="text-sovereign-gold text-lg font-bold font-display">S</span>
          </div>
          <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Sovereign Executive</p>
          <h1 className="font-display text-3xl text-sovereign-platinum">Apply for Membership</h1>
          <p className="text-sovereign-muted text-sm mt-2">
            Access the world's most prestigious executive network.
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: 'user', label: 'Member', sub: 'Pursue Opportunities' },
            { value: 'admin', label: 'Administrator', sub: 'Curate Talent' },
          ].map(({ value, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: value }))}
              className={`p-4 border text-left transition-all duration-200 rounded-sm ${
                form.role === value
                  ? 'border-sovereign-gold bg-sovereign-gold/5'
                  : 'border-sovereign-border hover:border-sovereign-gold/40'
              }`}
            >
              <p className={`text-sm font-semibold ${form.role === value ? 'text-sovereign-gold' : 'text-sovereign-platinum'}`}>
                {label}
              </p>
              <p className="text-sovereign-muted text-xs mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        <div className="card-sovereign">
          {displayError && (
            <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm rounded-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-sovereign">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Alexander Sterling"
                value={form.name}
                onChange={handleChange}
                className="input-sovereign"
              />
            </div>

            <div>
              <label className="label-sovereign">Institutional Email</label>
              <input
                name="email"
                type="email"
                required
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
                minLength={6}
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                className="input-sovereign"
              />
            </div>

            <div>
              <label className="label-sovereign">Confirm Passkey</label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => { setLocalError(''); setConfirm(e.target.value); }}
                className="input-sovereign"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Processing Membership...' : 'Establish Membership'}
            </button>
          </form>
        </div>

        <p className="text-center text-sovereign-muted text-sm mt-6">
          Already a member?{' '}
          <Link to="/login" className="text-sovereign-gold hover:text-sovereign-gold-light transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
