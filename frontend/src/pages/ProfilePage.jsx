import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function ProfilePage() {
  const { user, updateUser, demoLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      // If not logged in, provide initial defaults matching the screenshot
      setName('Rohit Jain');
      setEmail('rohitjaintrainer@gmail.com');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // If user is not logged in, log in as Rohit Jain or sign in first
    if (!user) {
      try {
        await demoLogin('applicant');
      } catch (err) {
        setError('Please sign in or create an account to save profile changes.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await client.patch('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.user) {
        updateUser(data.user);
      }
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="page-heading-block">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1 className="page-serif-title">Profile</h1>
        <p className="profile-subtitle">
          Keep your details current to get the most from CareerNest.
        </p>
      </div>

      <div className="profile-card">
        <h2 className="profile-card-title">Personal details</h2>

        {message && <div className="flash-banner success">{message}</div>}
        {error && <div className="flash-banner error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="field-label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohit Jain"
            />
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rohitjaintrainer@gmail.com"
            />
          </div>

          <div className="form-group">
            <label className="field-label">
              Profile image <span className="muted-hint">optional · max 2 MB</span>
            </label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0] || null)}
              />
            </div>
            {user?.avatar?.url && !avatarFile && (
              <div className="current-avatar-preview">
                <img src={user.avatar.url} alt="Current avatar" className="avatar-img-sm" />
                <span className="muted-hint">Current profile picture</span>
              </div>
            )}
          </div>

          <button type="submit" className="button full-width save-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

