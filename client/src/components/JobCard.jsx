import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  remote: 'Remote',
};

export default function JobCard({ job, onDelete, isAdmin }) {
  return (
    <div className="card-sovereign group hover:border-sovereign-gold/40 transition-all duration-300 flex flex-col gap-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={`/jobs/${job.id}`}
            className="font-display text-sovereign-platinum text-lg leading-snug hover:text-sovereign-gold transition-colors duration-200"
          >
            {job.title}
          </Link>
          <p className="text-sovereign-muted text-sm mt-1">{job.company}</p>
        </div>
        <span className="tag-type shrink-0">{TYPE_LABELS[job.type] || job.type}</span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-sovereign-muted">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        {job.compensation && (
          <span className="flex items-center gap-1 text-sovereign-gold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.compensation}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(job.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </span>
      </div>

      {/* Description preview */}
      <p className="text-sovereign-muted text-sm leading-relaxed line-clamp-2">{job.description}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-sovereign-border/50">
        <Link to={`/jobs/${job.id}`} className="btn-outline py-2 text-xs flex-1 text-center">
          View Details
        </Link>
        {isAdmin && (
          <button
            onClick={() => onDelete?.(job.id)}
            className="px-4 py-2 text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10
                       transition-all duration-200 rounded-sm tracking-wide"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
