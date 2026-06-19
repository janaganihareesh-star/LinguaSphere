import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const { t, setLang } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passUpdating, setPassUpdating] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        const { name, email, preferredLanguage } = res.data.user;
        setFormData({ name, email, preferredLanguage });
      } catch (err) {
        setMessage({ type: 'danger', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/api/auth/profile', {
        name: formData.name,
        preferredLanguage: formData.preferredLanguage
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setLang(formData.preferredLanguage); // Change app language instantly
      setMessage({ type: 'success', text: 'Profile updated successfully! ✨' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/api/auth/changepassword', passwords);
      setMessage({ type: 'success', text: 'Password changed successfully! 🔐' });
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Password change failed' });
    } finally {
      setPassUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="row justify-content-center animate-enter mb-5">
      <div className="col-md-6 col-lg-5">
        {/* Profile Info Card */}
        <div className="card shadow border-0 mb-4">
          <div className="card-body p-4">
            <h2 className="fw-bold mb-4">{t('profile_title')}</h2>
            
            {message.text && (
              <div className={`alert alert-${message.type} small py-2 mb-3`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">{t('full_name')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">{t('email')}</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={formData.email}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">{t('pref_lang')}</label>
                <select
                  className="form-select"
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="te">Telugu</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="ml">Malayalam</option>
                  <option value="kn">Kannada</option>
                  <option value="mr">Marathi</option>
                  <option value="bn">Bengali</option>
                  <option value="gu">Gujarati</option>
                  <option value="pa">Punjabi</option>
                  <option value="ar">Arabic</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={updating}>
                {updating ? <span className="spinner-border spinner-border-sm me-2"></span> : t('save_profile')}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card shadow border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">{t('change_pass_title')}</h5>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label small fw-bold">{t('curr_pass')}</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">{t('new_pass')}</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={passUpdating}>
                {passUpdating ? <span className="spinner-border spinner-border-sm me-2"></span> : t('update_pass')}
              </button>
            </form>
          </div>
        </div>

        <div className="card shadow border-0 bg-light">
          <div className="card-body p-3">
            <h6 className="fw-bold mb-2 small text-uppercase opacity-75">{t('account_status')}</h6>
            <p className="small text-muted mb-0">{t('role')}: <span className="badge bg-secondary">{user.role}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
