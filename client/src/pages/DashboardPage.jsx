import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../store/jobsSlice';
import { fetchApplications } from '../store/applicationsSlice';

const STATUS_STYLES = {
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40',
  reviewed: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
  accepted: 'bg-green-900/30 text-green-400 border-green-800/40',
  rejected: 'bg-red-900/30 text-red-400 border-red-800/40',
};

function StatCard({ label, value, gold }) {
  return (
    <div className="card-sovereign flex flex-col gap-1">
      <p className="text-sovereign-muted text-xs tracking-widest uppercase">{label}</p>
      <p className={`text-3xl font-display ${gold ? 'text-sovereign-gold' : 'text-sovereign-platinum'}`}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: jobs } = useSelector((s) => s.jobs);
  const { items: apps } = useSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchApplications());
  }, [dispatch]);

  const isAdmin = user?.role === 'admin';

  const pending = apps.filter((a) => a.status === 'pending').length;
  const accepted = apps.filter((a) => a.status === 'accepted').length;
  const recentItems = apps.slice(0, 5);

  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="mb-10 border-b border-sovereign-border pb-8">
        <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-2">Command Center</p>
        <h1 className="font-display text-4xl text-sovereign-platinum">
          Welcome, <span className="text-sovereign-gold">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-sovereign-muted text-sm mt-2 capitalize">
          {user?.role} · Sovereign Executive Network
        </p>
      </div>

      {/* Market Pulse */}
      <div className="mb-8 card-sovereign bg-sovereign-dark border-sovereign-gold/20">
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-1">Market Pulse</p>
            <p className="text-sovereign-gold font-display text-2xl">$240K Median Salary</p>
          </div>
          <div className="h-8 w-px bg-sovereign-border hidden md:block" />
          <div>
            <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-1">Market Growth</p>
            <p className="text-green-400 font-semibold text-lg">+12.5% YoY</p>
          </div>
          <div className="h-8 w-px bg-sovereign-border hidden md:block" />
          <div>
            <p className="text-sovereign-muted text-xs tracking-widest uppercase mb-1">Active Opportunities</p>
            <p className="text-sovereign-platinum font-semibold text-lg">{jobs.length}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {isAdmin ? (
          <>
            <StatCard label="Total Listings" value={jobs.length} gold />
            <StatCard label="Total Candidates" value={apps.length} />
            <StatCard label="Pending Review" value={pending} />
            <StatCard label="Accepted" value={accepted} gold />
          </>
        ) : (
          <>
            <StatCard label="Applied" value={apps.length} gold />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Accepted" value={accepted} gold />
            <StatCard label="Available Roles" value={jobs.length} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card-sovereign">
          <h2 className="font-display text-sovereign-platinum text-xl mb-4">Curated Opportunities</h2>
          {jobs.slice(0, 3).map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="flex items-center justify-between py-3 border-b border-sovereign-border/50 last:border-0
                         hover:text-sovereign-gold transition-colors duration-200 group"
            >
              <div>
                <p className="text-sovereign-platinum text-sm font-medium group-hover:text-sovereign-gold">
                  {job.title}
                </p>
                <p className="text-sovereign-muted text-xs mt-0.5">{job.company} · {job.location}</p>
              </div>
              <span className="text-sovereign-gold text-lg">›</span>
            </Link>
          ))}
          <Link to="/jobs" className="btn-outline w-full text-center mt-4 block text-xs py-2">
            Navigate Sovereign Market →
          </Link>
        </div>

        <div className="card-sovereign">
          <h2 className="font-display text-sovereign-platinum text-xl mb-4">
            {isAdmin ? 'Recent Candidates' : 'Recent Applications'}
          </h2>
          {recentItems.length === 0 ? (
            <p className="text-sovereign-muted text-sm py-4">
              No {isAdmin ? 'candidates' : 'applications'} yet.
            </p>
          ) : (
            recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-sovereign-border/50 last:border-0"
              >
                <div>
                  <p className="text-sovereign-platinum text-sm font-medium">
                    {isAdmin ? item.applicant?.name : item.job?.title}
                  </p>
                  <p className="text-sovereign-muted text-xs mt-0.5">
                    {isAdmin ? item.job?.title : item.job?.company}
                  </p>
                </div>
                <span className={`status-badge border px-2 py-0.5 ${STATUS_STYLES[item.status] || ''}`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
          <Link to="/applications" className="btn-outline w-full text-center mt-4 block text-xs py-2">
            {isAdmin ? 'View All Candidates →' : 'View All Applications →'}
          </Link>
        </div>
      </div>

      {isAdmin && (
        <div className="text-center">
          <Link to="/jobs/new" className="btn-gold inline-block">
            + Post New Opportunity
          </Link>
        </div>
      )}
    </div>
  );
}
