import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This will remove all their data.")) return;

    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger m-5">{error}</div>;
  }

  return (
    <div className="container animate-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Admin Panel 🛠️</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchData}>🔄 Refresh</button>
      </div>

      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>System Overview</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>User Management</button>
        </li>
      </ul>

      {tab === 'overview' ? (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body text-center py-4">
                <div className="fs-1 mb-2">👥</div>
                <h3 className="fw-bold">{stats.users}</h3>
                <div className="text-muted small uppercase">Total Registered Users</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body text-center py-4">
                <div className="fs-1 mb-2">🔄</div>
                <h3 className="fw-bold">{stats.translations}</h3>
                <div className="text-muted small uppercase">Global Translations</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-bold">{u.name}</div>
                      <small className="text-muted">{u._id}</small>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u.role === 'admin'} // Cannot delete other admins from here for safety
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
