import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, deleteJob } from '../store/jobsSlice';
import JobCard from '../components/JobCard';

const TYPES = ['all', 'full-time', 'part-time', 'contract', 'remote'];

export default function JobsPage() {
  const dispatch = useDispatch();
  const { items: jobs, status } = useSelector((s) => s.jobs);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [typeFilter, setType] = useState('all');

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const isAdmin = user?.role === 'admin';

  const filtered = jobs.filter((job) => {
    const matchType = typeFilter === 'all' || job.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleDelete = (id) => {
    if (window.confirm('Remove this opportunity from the network?')) {
      dispatch(deleteJob(id));
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 border-b border-sovereign-border pb-8">
        <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Sovereign Explorer</p>
        <h1 className="font-display text-4xl text-sovereign-platinum">Navigate the Sovereign Market</h1>
        <p className="text-sovereign-muted text-sm mt-2">
          {jobs.length} curated {jobs.length === 1 ? 'opportunity' : 'opportunities'} available
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title, company, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-sovereign flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 text-xs tracking-widest uppercase rounded-sm border transition-all duration-200 ${
                typeFilter === t
                  ? 'border-sovereign-gold bg-sovereign-gold/10 text-sovereign-gold'
                  : 'border-sovereign-border text-sovereign-muted hover:border-sovereign-gold/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {status === 'loading' ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-sovereign-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-sovereign-platinum text-2xl mb-2">No opportunities found</p>
          <p className="text-sovereign-muted text-sm">Adjust your search filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
