import React, { useState, useEffect } from 'react';
import api from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const filtered = history.filter(item => 
      item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
    setCurrentPage(1);
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/translate/history');
      setHistory(response.data.history);
      setFilteredHistory(response.data.history);
    } catch (err) {
      console.error('History Fetch Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this translation from history?")) return;
    
    try {
      setDeleteLoading(id);
      await api.delete(`/api/translate/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to clear ALL history? This cannot be undone.")) return;

    try {
      await api.delete('/api/translate/history/all');
      setHistory([]);
      setFilteredHistory([]);
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied! 📋');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="container animate-enter">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold mb-0">Translation History 📜</h2>
        {history.length > 0 && (
          <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteAll}>
            Clear All History
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">🔍</span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {filteredHistory.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <div style={{fontSize: '3rem'}}>📭</div>
          <h4 className="mt-3">No history found</h4>
          <p className="text-muted">
            {searchTerm ? "Try searching for something else." : "Start translating to see your history here!"}
          </p>
          {!searchTerm && <a href="/" className="btn btn-primary">Translate Now</a>}
        </div>
      ) : (
        <div className="row g-3">
          {currentItems.map((item) => (
            <div className="col-12" key={item._id}>
              <div className="card shadow-sm border-0 card-hover">
                <div className="card-header bg-light d-flex justify-content-between align-items-center border-0 py-2">
                  <div className="d-flex gap-2 align-items-center">
                    <span className="badge bg-secondary">{item.sourceLanguage}</span>
                    <span className="text-muted">→</span>
                    <span className="badge bg-primary">{item.targetLanguage}</span>
                  </div>
                  <small className="text-muted">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </small>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <p className="mb-1 text-muted small fw-bold">Original</p>
                      <p className="mb-0 text-truncate-custom">{item.inputText}</p>
                    </div>
                    <div className="col-md-1 text-center d-none d-md-block">
                      <span className="fs-4 text-muted">→</span>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted small fw-bold">Translation</p>
                      <p className="mb-0 text-primary fw-medium text-truncate-custom">{item.translatedText}</p>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2 py-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleCopy(item.translatedText)}>
                    📋 Copy
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteLoading === item._id}
                  >
                    {deleteLoading === item._id ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : '🗑 Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-5">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            <li className="page-item disabled">
              <span className="page-link text-dark">Page {currentPage} of {totalPages}</span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
      
      <style>{`
        .text-truncate-custom {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default History;
