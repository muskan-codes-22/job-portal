import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyJobForm = {
  title: '',
  companyName: '',
  companyLogoUrl: '',
  aboutCompany: '',
  location: '',
  employmentType: 'Full-time',
  skills: '',
  minSalary: '',
  maxSalary: '',
  description: '',
};

export default function DashboardPage() {
  const { user, demoLogin } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);
  const [form, setForm] = useState(emptyJobForm);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Submissions modal/drawer state
  const [selectedJobForSubmissions, setSelectedJobForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Load recruiter's jobs
  const loadRecruiterJobs = async () => {
    try {
      // First try /jobs/mine if logged in as recruiter
      const res = await client.get('/jobs/mine').catch(async () => {
        // Fallback to all jobs
        return await client.get('/jobs');
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs', err);
    }
  };

  useEffect(() => {
    loadRecruiterJobs();
  }, [user]);

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setActionMessage('');
    setErrorMessage('');
    setForm({
      title: job.title || '',
      companyName: job.companyName || '',
      companyLogoUrl: job.companyLogoUrl || '',
      aboutCompany: job.aboutCompany || '',
      location: job.location || '',
      employmentType: job.employmentType || 'Full-time',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      minSalary: job.salary?.min !== undefined ? String(job.salary.min) : '',
      maxSalary: job.salary?.max !== undefined ? String(job.salary.max) : '',
      description: job.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setForm(emptyJobForm);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionMessage('');
    setErrorMessage('');

    // Ensure logged in as recruiter/admin
    if (!user || user.role === 'applicant') {
      try {
        await demoLogin('recruiter');
      } catch (err) {
        setErrorMessage('Recruiter access required to post/edit jobs.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        companyName: form.companyName,
        companyLogoUrl: form.companyLogoUrl,
        aboutCompany: form.aboutCompany,
        location: form.location,
        employmentType: form.employmentType,
        skills: form.skills,
        minSalary: form.minSalary,
        maxSalary: form.maxSalary,
        description: form.description,
      };

      if (editingJobId) {
        await client.patch(`/jobs/${editingJobId}`, payload);
        setActionMessage('Job post updated successfully!');
      } else {
        await client.post('/jobs', payload);
        setActionMessage('Job role published successfully!');
      }

      setEditingJobId(null);
      setForm(emptyJobForm);
      await loadRecruiterJobs();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Operation failed. Please check the form fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmissions = async (job) => {
    setSelectedJobForSubmissions(job);
    setLoadingSubmissions(true);
    try {
      const { data } = await client.get(`/applications?jobId=${job._id}`);
      setSubmissions(data.applications || []);
    } catch (err) {
      console.error(err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <div className="management-dashboard">
      {/* Optional demo helper banner if user is applicant */}
      {user && user.role === 'applicant' && (
        <div className="role-switch-banner">
          <span>You are currently viewing as Applicant ({user.name}).</span>
          <button
            className="switch-role-btn"
            onClick={async () => {
              await demoLogin('recruiter');
              loadRecruiterJobs();
            }}
          >
            Switch to Recruiter Mode
          </button>
        </div>
      )}

      {actionMessage && <div className="flash-banner success">{actionMessage}</div>}
      {errorMessage && <div className="flash-banner error-banner">{errorMessage}</div>}

      <div className="management-grid">
        {/* LEFT CARD: Post a new role / Edit job post */}
        <div className="management-card left-card">
          <div className="management-card-header">
            <span className="card-eyebrow">JOB MANAGEMENT</span>
            {editingJobId && (
              <button
                type="button"
                className="cancel-edit-btn"
                onClick={handleCancelEdit}
              >
                Cancel edit
              </button>
            )}
          </div>

          <h2 className="card-serif-title">
            {editingJobId ? 'Edit job post' : 'Post a new role'}
          </h2>

          <form onSubmit={handleSubmit} className="job-form">
            {/* Row 1: Job title | Company name */}
            <div className="form-row two-col">
              <div className="form-group">
                <label className="field-label">Job title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="field-label">Company name</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>
            </div>

            {/* Row 2: Company logo URL optional */}
            <div className="form-group">
              <label className="field-label">
                Company logo URL <span className="muted-hint">optional</span>
              </label>
              <input
                type="text"
                value={form.companyLogoUrl}
                onChange={(e) => setForm({ ...form, companyLogoUrl: e.target.value })}
              />
            </div>

            {/* Row 3: About the company shown on job detail page */}
            <div className="form-group">
              <label className="field-label">
                About the company <span className="muted-hint">shown on job detail page</span>
              </label>
              <textarea
                rows="4"
                value={form.aboutCompany}
                onChange={(e) => setForm({ ...form, aboutCompany: e.target.value })}
              />
            </div>

            {/* Row 4: Location | Employment type */}
            <div className="form-row two-col">
              <div className="form-group">
                <label className="field-label">Location</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="field-label">Employment type</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Row 5: Skills comma-separated */}
            <div className="form-group">
              <label className="field-label">Skills comma-separated</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>

            {/* Row 6: Minimum salary | Maximum salary */}
            <div className="form-row two-col">
              <div className="form-group">
                <label className="field-label">Minimum salary</label>
                <input
                  type="number"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="field-label">Maximum salary</label>
                <input
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                />
              </div>
            </div>

            {/* Row 7: Role description */}
            <div className="form-group">
              <label className="field-label">Role description</label>
              <textarea
                rows="4"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="button full-width publish-button" disabled={loading}>
              {loading
                ? 'Processing...'
                : editingJobId
                ? 'Save changes'
                : 'Publish job'}
            </button>
          </form>
        </div>

        {/* RIGHT CARD: Job submissions */}
        <div className="management-card right-card">
          <div className="management-card-header">
            <span className="card-eyebrow">APPLICATIONS</span>
          </div>

          <h2 className="card-serif-title">Job submissions</h2>
          <p className="card-subtext">Choose a role to see its applicants.</p>

          <div className="submissions-divider" />

          <div className="submissions-roles-list">
            {jobs.length === 0 ? (
              <p className="muted" style={{ padding: '16px 0' }}>
                No active roles posted yet.
              </p>
            ) : (
              jobs.map((job) => {
                const isCurrentlyEditing = editingJobId === job._id;
                return (
                  <div key={job._id} className="submission-role-item">
                    <div className="role-meta">
                      <div className="role-meta-title">{job.title}</div>
                      <div className="role-meta-sub">
                        {job.companyName} · {job.location}
                      </div>
                    </div>

                    <div className="role-actions">
                      <button
                        type="button"
                        className={`action-btn-edit ${isCurrentlyEditing ? 'active' : ''}`}
                        onClick={() => handleEditClick(job)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-btn-submissions"
                        onClick={() => handleViewSubmissions(job)}
                      >
                        Submissions
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Submissions Modal / Drawer when recruiter clicks "Submissions" */}
      {selectedJobForSubmissions && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedJobForSubmissions(null)}
        >
          <div className="modal-box large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="sidebar-eyebrow">SUBMISSIONS</span>
              <h2 className="section-serif-heading" style={{ margin: '4px 0 6px' }}>
                Applicants for {selectedJobForSubmissions.title}
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                {selectedJobForSubmissions.companyName} · {selectedJobForSubmissions.location}
              </p>
            </div>

            <div className="submissions-modal-body">
              {loadingSubmissions ? (
                <p className="muted">Loading applications...</p>
              ) : submissions.length === 0 ? (
                <div className="no-submissions-box">
                  <p>No applications submitted for this role yet.</p>
                </div>
              ) : (
                <div className="applications-table-wrapper">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Date Applied</th>
                        <th>Resume</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <b>{app.applicant?.name || 'Applicant'}</b>
                          </td>
                          <td>{app.applicant?.email}</td>
                          <td>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {app.resume?.url ? (
                              <a
                                href={app.resume.url}
                                target="_blank"
                                rel="noreferrer"
                                className="resume-download-link"
                              >
                                View Resume
                              </a>
                            ) : (
                              <span className="muted">None</span>
                            )}
                          </td>
                          <td>
                            <span className="app-status-badge">
                              {app.status || 'submitted'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setSelectedJobForSubmissions(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
