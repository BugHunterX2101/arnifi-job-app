import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById, applyToJob, deleteJob, clearApplyStatus, clearSelected } from '../store/jobsSlice';

const TYPE_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  remote: 'Remote',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { selected: job, status, error, applyStatus, applyError } = useSelector((s) => s.jobs);

  const [coverLetter, setCoverLetter] = useState('');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
    // FIX: Clear selected job on unmount to prevent stale data flash
    // when navigating from one job detail page to another.
    return () => {
      dispatch(clearSelected());
      dispatch(clearApplyStatus());
    };
  }, [dispatch, id]);

  const handleApply = (e) => {
    e.preventDefault();
    dispatch(applyToJob({ id, coverLetter }));
  };

  const handleDelete = () => {
    if (window.confirm('Permanently remove this opportunity?')) {
      dispatch(deleteJob(id)).then(() => navigate('/jobs'));
    }
  };

  const isAdmin = user?.role === 'admin';

  // FIX: Distinguish between loading and error/not-found states.
  // Previously, if status became 'failed' but job was null, the spinner
  // would render indefinitely with no feedback to the user.
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-sovereign-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'failed' || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 animate-fade-in">
        <p className="font-display text-sovereign-platinum text-2xl">
          {error || 'Opportunity not found.'}
        </p>
        <Link to="/jobs" className="btn-outline py-2 text-sm">
          ← Back to Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          to="/jobs"
          className="text-sovereign-muted text-xs tracking-widest uppercase hover:text-sovereign-gold transition-colors"
        >
          ← Sovereign Explorer
        </Link>
      </div>

      {/* Header card */}
      <div className="card-sovereign mb-6 border-sovereign-gold/20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Executive Opportunity</p>
            <h1 className="font-display text-3xl text-sovereign-platinum">{job.title}</h1>
            <p className="text-sovereign-gold text-lg mt-1">{job.company}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="tag-type">{TYPE_LABELS[job.type] || job.type}</span>
            <span className="text-xs text-sovereign-muted tracking-widest uppercase">Active Recruitment</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-sovereign-border/50">
          <div>
            <p className="label-sovereign">Location</p>
            <p className="text-sovereign-platinum text-sm">{job.location}</p>
          </div>
          {job.compensation && (
            <div>
              <p className="label-sovereign">Compensation</p>
              <p className="text-sovereign-gold text-sm font-semibold">{job.compensation}</p>
            </div>
          )}
          <div>
            <p className="label-sovereign">Posted By</p>
            <p className="text-sovereign-platinum text-sm">{job.postedBy?.name || 'Sovereign Executive'}</p>
          </div>
          <div>
            <p className="label-sovereign">Posted</p>
            <p className="text-sovereign-platinum text-sm">
              {new Date(job.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card-sovereign mb-6">
        <h2 className="font-display text-sovereign-platinum text-xl mb-4">Executive Summary</h2>
        <p className="text-sovereign-muted text-sm leading-7 whitespace-pre-line">{job.description}</p>
      </div>

      {/* Apply succeeded */}
      {applyStatus === 'succeeded' && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-800/40 text-green-400 text-sm rounded-sm animate-fade-in">
          Application submitted successfully. The team will be in touch.{' '}
          <Link to="/applications" className="underline">View your applications →</Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {!isAdmin && !showApply && applyStatus !== 'succeeded' && (
          <button onClick={() => setShowApply(true)} className="btn-gold">
            Submit Application
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="btn-outline border-red-400/40 text-red-400 hover:bg-red-400/10 hover:text-red-400"
          >
            Remove Opportunity
          </button>
        )}
      </div>

      {/* Apply Form */}
      {showApply && applyStatus !== 'succeeded' && (
        <form onSubmit={handleApply} className="card-sovereign mt-6 animate-slide-up">
          <h2 className="font-display text-sovereign-platinum text-xl mb-4">Submit Application</h2>

          {applyError && (
            <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm rounded-sm">
              {applyError}
            </div>
          )}

          <div className="mb-5">
            <label className="label-sovereign">Cover Letter (optional)</label>
            <textarea
              rows={6}
              placeholder="Express your executive mandate and why you are uniquely positioned for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="input-sovereign resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={applyStatus === 'loading'}
              className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {applyStatus === 'loading' ? 'Submitting...' : 'Confirm Application'}
            </button>
            <button type="button" onClick={() => setShowApply(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
