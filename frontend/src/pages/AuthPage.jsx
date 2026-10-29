import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'applicant',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await client.post('/auth/register', form);
        await login({ email: form.email, password: form.password });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      navigate(role === 'recruiter' ? '/dashboard' : '/jobs');
    } catch (err) {
      setError('Could not sign in to demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <p className="eyebrow">Welcome to CareerNest</p>
      <h1>{isLogin ? 'Good to see you again.' : 'Start your next chapter.'}</h1>

      {error && <div className="flash-banner error-banner">{error}</div>}

      <form onSubmit={submit}>
        <div className="form-group">
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@domain.com"
          />
        </div>

        {!isLogin && (
          <>
            <div className="form-group">
              <label className="field-label">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label className="field-label">Joining as</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="applicant">Applicant</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label className="field-label">Password</label>
          <input
            type="password"
            minLength="8"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <button className="button full-width" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="demo-accounts-box">
        <p className="demo-tagline">Or test with one-click demo login:</p>
        <div className="demo-buttons-row">
          <button
            type="button"
            className="demo-btn"
            onClick={() => handleQuickDemo('recruiter')}
          >
            Sign in as Recruiter
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => handleQuickDemo('applicant')}
          >
            Sign in as Rohit Jain (Applicant)
          </button>
        </div>
      </div>

      <p className="auth-footer-text">
        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
        <Link to={isLogin ? '/register' : '/login'}>
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </section>
  );
}
