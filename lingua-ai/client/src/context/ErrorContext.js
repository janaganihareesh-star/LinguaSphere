import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = useCallback((message) => {
    setError(message);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  }, []);

  const hideError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError, hideError }}>
      {children}
      {error && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-danger border-0" role="alert">
            <div className="d-flex">
              <div className="toast-body">
                ⚠️ {error}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={hideError}></button>
            </div>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
