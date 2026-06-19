import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    localStorage.clear();
    window.location.replace('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark' : 'navbar-light'} sticky-top shadow-sm`}>
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">
          🌐 {t('app_name')}
        </NavLink>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">{t('home')}</NavLink>
            </li>
            {token && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/history">{t('history')}</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/favorites">{t('favorites')}</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">{t('dashboard')}</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/ocr">{t('ocr_translate')}</NavLink>
                </li>
              </>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button 
              className={`btn btn-link p-0 text-decoration-none fs-5 ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {token ? (
              <div className="dropdown">
                <button className={`btn btn-sm dropdown-toggle ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`} type="button" id="userDropdown" data-bs-toggle="dropdown">
                  {user?.name} 👤
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li><NavLink className="dropdown-item" to="/profile">{t('my_profile')}</NavLink></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>{t('logout')}</button></li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <NavLink className={`btn btn-sm ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`} to="/login">{t('login')}</NavLink>
                <NavLink className="btn btn-primary btn-sm" to="/register">{t('register')}</NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
