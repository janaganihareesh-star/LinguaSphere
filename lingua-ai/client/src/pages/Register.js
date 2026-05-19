import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5 animate-enter">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold">Create Account 🚀</h2>
              <p className="text-muted">Join LinguaAI for smart translations</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label small fw-bold">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : 'Register'}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="small text-muted mb-0">
                Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
