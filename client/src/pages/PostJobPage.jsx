import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../store/jobsSlice';

const TYPES = ['full-time', 'part-time', 'contract', 'remote'];
const TYPE_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  remote: 'Remote',
};

export default function PostJobPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'full-time', description: '', compensation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => {
    setError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dispatch(createJob(form)).unwrap();
      navigate('/jobs');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Command Center</p>
        <h1 className="font-display text-4xl text-sovereign-platinum">Post New Opportunity</h1>
        <p className="text-sovereign-muted text-sm mt-2">Curate the next sovereign executive role.</p>
      </div>

      <div className="card-sovereign">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label-sovereign">Role Title</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Global Director of Operations"
                className="input-sovereign"
              />
            </div>
            <div>
              <label className="label-sovereign">Organisation</label>
              <input
                name="company"
                required
                value={form.company}
                onChange={handleChange}
                placeholder="Sovereign Capital Group"
                className="input-sovereign"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label-sovereign">Location</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="Zurich, Switzerland (On-site)"
                className="input-sovereign"
              />
            </div>
            <div>
              <label className="label-sovereign">Compensation Package</label>
              <input
                name="compensation"
                value={form.compensation}
                onChange={handleChange}
                placeholder="$450K – $520K"
                className="input-sovereign"
              />
            </div>
          </div>

          <div>
            <label className="label-sovereign">Engagement Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  className={`py-2.5 text-xs tracking-widest uppercase border transition-all duration-200 rounded-sm ${
                    form.type === t
                      ? 'border-sovereign-gold bg-sovereign-gold/10 text-sovereign-gold'
                      : 'border-sovereign-border text-sovereign-muted hover:border-sovereign-gold/40'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-sovereign">Executive Summary & Requirements</label>
            <textarea
              name="description"
              required
              rows={8}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the mandate, core responsibilities, required background..."
              className="input-sovereign resize-none"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Opportunity'}
            </button>
            <button type="button" onClick={() => navigate('/jobs')} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
