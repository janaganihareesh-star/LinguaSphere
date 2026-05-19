import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    const filtered = favorites.filter(item => 
      item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFavorites(filtered);
  }, [searchTerm, favorites]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/favorites');
      setFavorites(response.data.favorites);
      setFilteredFavorites(response.data.favorites);
    } catch (err) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this from favorites?")) return;
    
    try {
      setDeleteLoading(id);
      await api.delete(`/api/favorites/${id}`);
      setFavorites(favorites.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to remove favorite');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied! 📋');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="container animate-enter">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Saved Favorites ⭐</h2>
      </div>

      <div className="mb-4">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">🔍</span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <div style={{fontSize: '3rem'}}>⭐</div>
          <h4 className="mt-3">No favorites found</h4>
          <p className="text-muted">
            {searchTerm ? "No matches for your search." : "Click ☆ on any translation to save it here!"}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredFavorites.map((item) => (
            <div className="col-12" key={item._id}>
              <div className="card shadow-sm border-0 card-hover">
                <div className="card-header bg-light d-flex justify-content-between align-items-center border-0 py-2">
                  <div className="d-flex gap-2 align-items-center">
                    <span className="badge bg-secondary">{item.sourceLanguage}</span>
                    <span className="text-muted">→</span>
                    <span className="badge bg-primary">{item.targetLanguage}</span>
                  </div>
                  <small className="text-muted">
                    Saved on {new Date(item.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <p className="mb-1 text-muted small fw-bold">Original</p>
                      <p className="mb-0">{item.inputText}</p>
                    </div>
                    <div className="col-md-1 text-center d-none d-md-block">
                      <span className="fs-4 text-muted">→</span>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted small fw-bold">Translation</p>
                      <p className="mb-0 text-primary fw-medium">{item.translatedText}</p>
                    </div>
                  </div>
                  {item.note && (
                    <div className="mt-3 p-2 bg-light rounded">
                      <small className="fst-italic text-muted">Note: {item.note}</small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2 py-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleCopy(item.translatedText)}>
                    📋 Copy
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleRemove(item._id)}
                    disabled={deleteLoading === item._id}
                  >
                    {deleteLoading === item._id ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : '🗑 Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
