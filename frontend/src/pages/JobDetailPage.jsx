import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getCompanyInitials, timeAgo } from '../utils/formatters';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, markJobAsViewed } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    client
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        setJob(data.job);
        markJobAsViewed(data.job._id);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Role not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Check if current user already applied
  useEffect(() => {
    if (user && user.role === 'applicant') {
      client
        .get('/applications')
        .then(({ data }) => {
          const hasApplied = data.applications?.some(
            (app) => app.job?._id === id || app.job === id
          );
          if (hasApplied) setApplied(true);
        })
        .catch(() => {});
    }
  }, [user, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setApplyMessage('');

    try {
      const formData = new FormData();
      formData.append('jobId', id);
      if (coverLetter) formData.append('coverLetter', coverLetter);
      if (resumeFile) formData.append('resume', resumeFile);

      await client.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplied(true);
      setShowApplyModal(false);
      setApplyMessage('Application submitted successfully!');
    } catch (err) {
      setApplyMessage(err.response?.data?.message || 'Could not submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-loading">
        <p>Loading role details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-error">
        <p>{error || 'Job not found'}</p>
        <Link to="/jobs" className="back-link">
          ← All jobs
        </Link>
      </div>
    );
  }

  const initials = getCompanyInitials(job.companyName);
  const timeString = timeAgo(job.createdAt);
  const companyInfo =
    job.aboutCompany && job.aboutCompany.trim()
      ? job.aboutCompany
      : 'Company information will be shared by the recruiter soon.';

  return (
    <div className="job-detail-page">
      <Link to="/jobs" className="back-link">
        ← All jobs
      </Link>

      {applyMessage && (
        <div className="flash-banner success">
          {applyMessage}
        </div>
      )}

      <div className="job-detail-layout">
        {/* Main Content (Left) */}
        <div className="job-detail-main">
          {/* Header */}
          <div className="job-detail-header">
            <div className="company-logo-badge large">
              {job.companyLogoUrl ? (
                <img
                  src={job.companyLogoUrl}
                  alt={job.companyName}
                  className="company-logo-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="job-detail-header-text">
              <span className="job-type-tag">
                {(job.employmentType || 'FULL-TIME').toUpperCase()}
              </span>
              <h1 className="job-detail-title">{job.title}</h1>
              <p className="job-detail-subline">
                {job.companyName} · {job.location} · Posted {timeString}
              </p>
            </div>
          </div>

          <div className="section-divider" />

          {/* About the role */}
          <section className="job-detail-section">
            <h2 className="section-serif-heading">About the role</h2>
            <p className="job-description-text">{job.description}</p>

            {job.skills && job.skills.length > 0 && (
              <div className="skills-pill-group">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className="section-divider" />

          {/* About Company */}
          <section className="job-detail-section">
            <h2 className="section-serif-heading">About {job.companyName}</h2>
            <p className="company-info-text">{companyInfo}</p>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <aside className="job-detail-sidebar">
          <div className="interested-card">
            <span className="sidebar-eyebrow">INTERESTED?</span>
            <h2 className="sidebar-heading">Make your move.</h2>
            <p className="sidebar-text">
              Apply directly and keep track of your application from your workspace.
            </p>

            {applied ? (
              <button className="button full-width applied-button" disabled>
                Applied ✓
              </button>
            ) : (
              <button
                className="button full-width apply-action-button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowApplyModal(true);
                  }
                }}
              >
                Apply now
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="modal-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="sidebar-eyebrow">APPLICATION</span>
              <h2 className="section-serif-heading" style={{ margin: '4px 0 12px' }}>
                Apply to {job.companyName}
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Role: <b>{job.title}</b>
              </p>
            </div>

            <form onSubmit={handleApply} className="modal-form">
              <div className="form-group">
                <label>Cover note (optional)</label>
                <textarea
                  rows="4"
                  placeholder="Share a short note on why you are interested in this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Resume (PDF or DOCX, optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>

              {applyMessage && <p className="error">{applyMessage}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

