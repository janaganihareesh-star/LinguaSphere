import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5 animate-enter">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold">Welcome Back 👋</h2>
              <p className="text-muted">Login to save your translations</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : 'Login'}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="small text-muted mb-0">
                Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
