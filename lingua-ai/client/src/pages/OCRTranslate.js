import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import api from '../services/api';

const OCRTranslate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);
  const [error, setError] = useState('');
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB)");
      return;
    }

    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setExtractedText('');
    setTranslatedText('');
    setError('');
  };

  const handleOCR = async () => {
    if (!selectedImage) return setError("Please upload an image first");

    setOcrLoading(true);
    setOcrProgress(0);
    setExtractedText('');

    try {
      const result = await Tesseract.recognize(
        selectedImage,
        ocrLanguage,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
            setOcrStatus(m.status);
          }
        }
      );
      setExtractedText(result.data.text.trim());
    } catch (err) {
      setError("OCR failed to process the image");
    } finally {
      setOcrLoading(false);
      setOcrProgress(100);
    }
  };

  const handleTranslate = async () => {
    if (!extractedText.trim()) return setError("No text found. Run OCR first.");

    setTranslateLoading(true);
    try {
      const res = await api.post('/api/translate', { 
        text: extractedText, 
        sourceLang: 'auto', 
        targetLang 
      });
      setTranslatedText(res.data.translatedText);
    } catch (err) {
      setError("Translation failed");
    } finally {
      setTranslateLoading(false);
    }
  };

  return (
    <div className="container animate-enter mb-5">
      <h2 className="fw-bold mb-4">OCR Translation 📸</h2>
      <p className="text-muted mb-4">Upload an image to extract and translate text instantly.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Upload Section */}
      <div 
        className={`upload-box shadow-sm mb-4 ${isDragging ? 'upload-box-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageUpload(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('imageInput').click()}
      >
        <input 
          id="imageInput" 
          type="file" 
          accept="image/*" 
          hidden 
          onChange={(e) => handleImageUpload(e.target.files[0])} 
        />
        <div className="py-4">
          <div style={{fontSize: '3rem'}}>☁️</div>
          <p className="fw-bold mb-1">Drop image here or click to upload</p>
          <small className="text-muted">Supports JPG, PNG, GIF, WebP (max 10MB)</small>
        </div>
      </div>

      {imagePreviewUrl && (
        <div className="row g-4 mt-2">
          {/* Image Preview */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3 fw-bold">Image Preview</div>
              <div className="card-body text-center p-3">
                <img src={imagePreviewUrl} alt="Preview" className="img-fluid rounded" style={{maxHeight: '400px'}} />
              </div>
            </div>
          </div>

          {/* OCR Control */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3 fw-bold">Step 1: Extract Text</div>
              <div className="card-body">
                <label className="form-label small fw-bold text-primary">
                  What language is the text IN THE IMAGE?
                </label>
                <select className="form-select mb-2" value={ocrLanguage} onChange={e => setOcrLanguage(e.target.value)}>
                  <option value="eng">English (Default)</option>
                  <option value="hin">Hindi</option>
                  <option value="tel">Telugu</option>
                  <option value="spa">Spanish</option>
                  <option value="fra">French</option>
                  <option value="deu">German</option>
                </select>
                <div className="form-text text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                  ⚠️ Select the exact language of the text visible in your photo, NOT the language you want to translate to.
                </div>

                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleOCR} 
                  disabled={ocrLoading}
                >
                  {ocrLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : 'Extract Text from Image'}
                </button>

                {ocrLoading && (
                  <div className="mt-3">
                    <div className="progress" style={{height: '10px'}}>
                      <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: `${ocrProgress}%`}}></div>
                    </div>
                    <small className="text-muted mt-1 d-block text-capitalize">{ocrStatus}... {ocrProgress}%</small>
                  </div>
                )}

                {extractedText && (
                  <div className="mt-4">
                    <label className="form-label small fw-bold">Extracted Text (Editable):</label>
                    <textarea 
                      className="form-control mb-2" 
                      rows={5} 
                      value={extractedText} 
                      onChange={e => setExtractedText(e.target.value)}
                    />
                    <small className="text-muted">{extractedText.length} characters found</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translation Section */}
      {extractedText && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header bg-white py-3 fw-bold">Step 2: Translate Extracted Text</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Target Language</label>
                <select className="form-select" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  <option value="en">English</option>
                  <option value="te">Telugu</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="col-md-8 d-flex align-items-end">
                <button className="btn btn-success w-100" onClick={handleTranslate} disabled={translateLoading}>
                  {translateLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Translate Now'}
                </button>
              </div>
            </div>

            {translatedText && (
              <div className="mt-4">
                <label className="form-label small fw-bold">Translation Result:</label>
                <textarea className="form-control bg-light" rows={5} readOnly value={translatedText} />
                <button 
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={() => { navigator.clipboard.writeText(translatedText); alert('Copied! 📋'); }}
                >
                  📋 Copy Translation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRTranslate;
