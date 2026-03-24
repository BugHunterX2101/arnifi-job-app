import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-xs tracking-widest uppercase transition-colors duration-200 ${
      isActive ? 'text-sovereign-gold' : 'text-sovereign-muted hover:text-sovereign-platinum'
    }`;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-sovereign-black/90 backdrop-blur border-b border-sovereign-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="w-7 h-7 border border-sovereign-gold flex items-center justify-center">
            <span className="text-sovereign-gold text-xs font-bold">S</span>
          </span>
          <div>
            <p className="text-sovereign-platinum text-xs font-semibold tracking-widest uppercase leading-none">
              Sovereign
            </p>
            <p className="text-sovereign-gold text-[10px] tracking-widest uppercase leading-none">
              Executive
            </p>
          </div>
        </Link>

        {/* Nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/jobs" className={linkClass}>
              Opportunities
            </NavLink>
            {user.role === 'user' && (
              <NavLink to="/applications" className={linkClass}>
                My Applications
              </NavLink>
            )}
            {user.role === 'admin' && (
              <>
                <NavLink to="/applications" className={linkClass}>
                  Candidates
                </NavLink>
                <NavLink to="/jobs/new" className={linkClass}>
                  Post Job
                </NavLink>
              </>
            )}
            <NavLink to="/dashboard" className={linkClass}>
              Command Center
            </NavLink>
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sovereign-platinum text-xs font-medium leading-none">{user.name}</p>
                <p className="text-sovereign-gold text-[10px] tracking-widest uppercase leading-none mt-0.5 capitalize">
                  {user.role}
                </p>
              </div>
              <button onClick={handleLogout} className="btn-outline py-2 px-4 text-xs">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-ghost text-xs tracking-widest uppercase">
                Sign In
              </Link>
              <Link to="/signup" className="btn-gold py-2 px-4 text-xs">
                Apply for Membership
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
