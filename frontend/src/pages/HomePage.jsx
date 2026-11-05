import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const highlights = [
  { value: '01', label: 'Explore roles that fit your next chapter' },
  { value: '02', label: 'Apply with confidence using your resume' },
  { value: '03', label: 'Track every application in one place' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Careers, made human</p>
        <h1>Find work that fits your next chapter.</h1>
        <p className="lead">
          Search thoughtful opportunities, apply with confidence, and keep every
          application in one calm workspace.
        </p>
        <div className="actions">
          <Link className="button" to="/jobs">
            Explore jobs
          </Link>
          <Link className="button secondary" to={user ? '/profile' : '/register'}>
            {user ? 'View your profile' : 'Create an account'}
          </Link>
        </div>
      </div>

      <div className="hero-highlights" aria-label="CareerNest highlights">
        <p className="hero-highlights-title">A more thoughtful job search</p>
        {highlights.map(({ value, label }) => (
          <div className="hero-highlight" key={label}>
            <span className="hero-highlight-value">{value}</span>
            <span className="hero-highlight-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
