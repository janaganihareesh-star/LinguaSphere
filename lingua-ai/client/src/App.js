import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorProvider } from './context/ErrorContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Page placeholders
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import OCRTranslate from './pages/OCRTranslate';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <ErrorProvider>
        <Navbar />
        <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ocr" element={<ProtectedRoute><OCRTranslate /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App;
