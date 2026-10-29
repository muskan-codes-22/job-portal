import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getCompanyInitials, timeAgo } from '../utils/formatters';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    employmentType: 'Any type',
  });

  const { isJobViewed, markJobAsViewed } = useAuth();

  const loadJobs = async (customFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (customFilters.keyword) params.keyword = customFilters.keyword;
      if (customFilters.location) params.location = customFilters.location;
      if (customFilters.employmentType && customFilters.employmentType !== 'Any type') {
        params.employmentType = customFilters.employmentType;
      }
      const { data } = await client.get('/jobs', { params });
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="jobs-page-container">
      <div className="page-heading-block">
        <p className="eyebrow">OPEN ROLES</p>
        <h1 className="page-serif-title">Find your next opportunity</h1>
      </div>

      {/* Filter Bar */}
      <form className="search-filters-bar" onSubmit={handleSearch}>
        <div className="filter-field flex-grow-2">
          <input
            type="text"
            placeholder="Title, skill, or company"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          />
        </div>

        <div className="filter-field flex-grow-1">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>

        <div className="filter-field flex-grow-1">
          <select
            value={filters.employmentType}
            onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
          >
            <option value="Any type">Any type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <button type="submit" className="button search-button">
          Search
        </button>
      </form>

      {/* Job Cards List */}
      <div className="jobs-list-container">
        {loading ? (
          <p className="muted">Finding open roles...</p>
        ) : jobs.length === 0 ? (
          <div className="no-jobs-found">
            <p className="lead">No open roles match those filters right now.</p>
            <button
              className="button secondary"
              onClick={() => {
                const reset = { keyword: '', location: '', employmentType: 'Any type' };
                setFilters(reset);
                loadJobs(reset);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const initials = getCompanyInitials(job.companyName);
            const timeString = timeAgo(job.createdAt);
            const viewed = isJobViewed(job._id);

            return (
              <Link
                to={`/jobs/${job._id}`}
                key={job._id}
                className="role-card-item"
                onClick={() => markJobAsViewed(job._id)}
              >
                <div className="company-logo-badge">
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

                <div className="role-card-content">
                  <div className="role-title-row">
                    <span className="role-title-text">{job.title}</span>
                    {viewed && <span className="viewed-badge">Viewed</span>}
                  </div>
                  <div className="role-company-location">
                    {job.companyName} · {job.location}
                  </div>
                  <div className="role-time-type">
                    {timeString} · {job.employmentType}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
