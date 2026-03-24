import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications, updateApplicationStatus } from '../store/applicationsSlice';

const STATUS_STYLES = {
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40',
  reviewed: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  accepted: 'bg-green-900/30 text-green-400 border-green-800/40',
  rejected: 'bg-red-900/30 text-red-400 border-red-800/40',
};

const STATUSES = ['pending', 'reviewed', 'accepted', 'rejected'];

export default function ApplicationsPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.applications);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchApplications()); }, [dispatch]);

  const isAdmin = user?.role === 'admin';

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateApplicationStatus({ id, status: newStatus }));
  };

  return (
    <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 border-b border-sovereign-border pb-8">
        <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">
          {isAdmin ? 'Candidate Pipeline' : 'My Applications'}
        </p>
        <h1 className="font-display text-4xl text-sovereign-platinum">
          {isAdmin ? 'Talent Candidates' : 'Application Portfolio'}
        </h1>
        <p className="text-sovereign-muted text-sm mt-2">
          {items.length} {items.length === 1 ? 'record' : 'records'}
        </p>
      </div>

      {status === 'loading' ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-sovereign-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-sovereign-platinum text-2xl mb-2">No records yet</p>
          <p className="text-sovereign-muted text-sm">
            {isAdmin
              ? 'No applications received for any postings.'
              : 'You have not applied to any opportunities.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card-sovereign hover:border-sovereign-border transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h3 className="font-display text-sovereign-platinum text-lg">{item.job?.title}</h3>
                    <span className={`status-badge border mt-0.5 ${STATUS_STYLES[item.status] || ''}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-sovereign-gold text-sm">{item.job?.company}</p>
                  <p className="text-sovereign-muted text-xs mt-1">
                    {item.job?.location} · {item.job?.type}
                  </p>

                  {isAdmin && item.applicant && (
                    <div className="mt-3 pt-3 border-t border-sovereign-border/50">
                      <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-1">Candidate</p>
                      <p className="text-sovereign-platinum text-sm font-medium">{item.applicant.name}</p>
                      <p className="text-sovereign-muted text-xs">{item.applicant.email}</p>
                    </div>
                  )}

                  {item.coverLetter && (
                    <div className="mt-3 pt-3 border-t border-sovereign-border/50">
                      <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-1">Cover Letter</p>
                      <p className="text-sovereign-muted text-sm leading-relaxed line-clamp-3">
                        {item.coverLetter}
                      </p>
                    </div>
                  )}

                  <p className="text-sovereign-muted text-xs mt-3">
                    Applied{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Admin Status Changer */}
                {isAdmin && (
                  <div className="shrink-0">
                    <p className="label-sovereign mb-2">Update Status</p>
                    <div className="flex flex-col gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(item.id, s)}
                          className={`px-3 py-1.5 text-xs tracking-widest uppercase border rounded-sm transition-all duration-200 ${
                            item.status === s
                              ? STATUS_STYLES[s] + ' border-current'
                              : 'border-sovereign-border text-sovereign-muted hover:border-sovereign-gold/40'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
