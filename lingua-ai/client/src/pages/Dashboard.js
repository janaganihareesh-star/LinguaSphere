import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, historyRes] = await Promise.all([
          api.get('/api/translate/stats'),
          api.get('/api/translate/history')
        ]);
        setStats(statsRes.data);
        setRecentHistory(historyRes.data.history.slice(0, 5));
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading your overview...</p>
      </div>
    );
  }

  return (
    <div className="container animate-enter">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back, {user.name}! 👋</h2>
        <p className="text-muted">Here's an overview of your translation activity.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm bg-primary text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">📊</div>
              <h3 className="fw-bold mb-0">{stats.totalTranslations || 0}</h3>
              <small className="opacity-75">Total Translations</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm bg-warning text-dark">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">⭐</div>
              <h3 className="fw-bold mb-0">{stats.totalFavorites || 0}</h3>
              <small className="opacity-75">Favorites Saved</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm bg-success text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">📅</div>
              <h3 className="fw-bold mb-0">{stats.last7Days || 0}</h3>
              <small className="opacity-75">Last 7 Days</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card h-100 border-0 shadow-sm bg-info text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">🌍</div>
              <h3 className="fw-bold mb-0">{stats.topLanguages?.length || 0}</h3>
              <small className="opacity-75">Languages Used</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Activity */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Translations</h5>
              <Link to="/history" className="btn btn-sm btn-link text-decoration-none">View All</Link>
            </div>
            <div className="card-body p-0">
              {recentHistory.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentHistory.map((item) => (
                    <div key={item._id} className="list-group-item py-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted text-truncate" style={{maxWidth: '45%'}}>{item.inputText}</small>
                        <span className="text-muted small">→</span>
                        <small className="text-primary text-truncate fw-medium" style={{maxWidth: '45%'}}>{item.translatedText}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark border">{item.sourceLanguage} to {item.targetLanguage}</span>
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{new Date(item.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No recent activity found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Languages */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Most Translated To</h5>
            </div>
            <div className="card-body">
              {stats.topLanguages?.length > 0 ? (
                <div>
                  {stats.topLanguages.map((lang, index) => (
                    <div key={index} className="mb-4">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-uppercase fw-bold small">{lang._id}</span>
                        <span className="text-muted small">{lang.count} uses</span>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{width: `${(lang.count / stats.totalTranslations) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">Translate more to see trends!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
