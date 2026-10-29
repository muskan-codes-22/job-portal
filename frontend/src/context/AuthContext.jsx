import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewedJobs, setViewedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('careernest_viewed_jobs') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    client
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { data } = await client.post('/auth/login', credentials);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const demoLogin = async (role = 'recruiter') => {
    const email = role === 'recruiter' ? 'recruiter@careernest.local' : 'rohitjaintrainer@gmail.com';
    return login({ email, password: 'password123' });
  };

  const markJobAsViewed = (jobId) => {
    if (!jobId) return;
    setViewedJobs((prev) => {
      if (prev.includes(jobId)) return prev;
      const updated = [...prev, jobId];
      try {
        localStorage.setItem('careernest_viewed_jobs', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const isJobViewed = (jobId) => {
    return viewedJobs.includes(jobId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        demoLogin,
        viewedJobs,
        markJobAsViewed,
        isJobViewed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
