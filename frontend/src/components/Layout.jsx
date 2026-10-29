import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout, demoLogin } = useAuth();

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <Link className="brand" to="/">
          CareerNest
        </Link>
        <nav className="site-nav">
          <NavLink
            to="/jobs"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Find jobs
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {user.role === 'recruiter' ? 'Job Management' : 'Dashboard'}
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Profile
              </NavLink>
              <span className="user-greeting-pill">
                {user.name.split(' ')[0]} ({user.role})
              </span>
              <button className="link-button signout-button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Sign in
              </NavLink>
              <Link className="button small" to="/register">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="site-main">{children}</main>
    </div>
  );
}
