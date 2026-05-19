import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useSpeechRecognition, { SPEECH_LANG_CODES } from '../hooks/useSpeechRecognition';
import useTextToSpeech, { TTS_LANG_CODES } from '../hooks/useTextToSpeech';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  const { 
    transcript, 
    listening, 
    supported: speechSupported, 
    startListening, 
    stopListening, 
    setTranscript 
  } = useSpeechRecognition();

  const { 
    isSpeaking, 
    supported: ttsSupported, 
    speak, 
    stopSpeaking 
  } = useTextToSpeech();

  // Update input text when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      setCharCount(transcript.length);
    }
  }, [transcript]);

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setCharCount(0);
    setError('');
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      alert('Copied to clipboard! 📋');
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      return setError('Please enter text to translate');
    }

    if (sourceLang === targetLang && sourceLang !== 'auto') {
      return setError('Source and target languages cannot be same');
    }

    setLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const response = await api.post('/api/translate', { 
        text: inputText, 
        sourceLang, 
        targetLang 
      });
      
      setTranslatedText(response.data.translatedText);
      
      // Check if this new translation is already favorited
      const favCheck = await api.get(`/api/favorites/check?inputText=${encodeURIComponent(inputText)}&translatedText=${encodeURIComponent(response.data.translatedText)}`);
      setIsFavorited(favCheck.data.isFavorite);
      setFavoriteId(favCheck.data.favoriteId);

      if (response.data.detectedLanguage) {
        console.log(`Detected language: ${response.data.detectedLanguage}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Translation failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!translatedText) return;

    try {
      if (isFavorited) {
        await api.delete(`/api/favorites/${favoriteId}`);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const response = await api.post('/api/favorites', {
          inputText,
          translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        });
        setIsFavorited(true);
        setFavoriteId(response.data.favorite._id);
      }
    } catch (err) {
      alert('Failed to update favorites');
    }
  };

  return (
    <div className="container mt-4 animate-enter">
      <div className="text-center mb-4">
        <h1 className="fw-bold">{t('ai_translator')}</h1>
        <p className="text-muted">{t('ai_subtitle')}</p>
      </div>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      <div className="row g-4">
        {/* Source Section */}
        <div className="col-12 col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <select 
                className="form-select border-0 fw-bold" 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                <option value="auto">{t('source_lang')}</option>
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="card-body p-0">
              <textarea
                className="form-control border-0 p-3"
                rows={8}
                placeholder={t('enter_text')}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                maxLength={5000}
              />
            </div>
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <div>
                {!listening ? (
                  <button 
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => startListening(SPEECH_LANG_CODES[sourceLang])}
                    disabled={!speechSupported}
                    title={!speechSupported ? "Voice input not supported in this browser" : "Start speaking"}
                  >
                    🎤 {t('speak')}
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm btn-danger me-2"
                    onClick={stopListening}
                  >
                    ⏹ {t('stop')}
                  </button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={handleClear}>✕ {t('clear')}</button>
                {listening && <small className="text-danger ms-2 recording-pulse">● {t('recording')}</small>}
              </div>
              <small className="text-muted">{charCount} / 5000</small>
            </div>
          </div>
        </div>

        {/* Swap Button for Desktop */}
        <div className="col-12 col-md-2 d-none d-md-flex align-items-center justify-content-center">
          <button 
            className="btn btn-light shadow-sm rounded-circle p-3" 
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto'}
          >
            ⇄
          </button>
        </div>

        {/* Target Section */}
        <div className="col-12 col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <select 
                className="form-select border-0 fw-bold" 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="card-body p-0">
              <textarea
                className="form-control border-0 p-3 bg-light"
                rows={8}
                readOnly
                placeholder={t('translation_here')}
                value={translatedText}
              />
            </div>
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <div>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={handleCopy}>📋 {t('copy')}</button>
                {translatedText && (
                  <button 
                    className={`btn btn-sm me-2 ${isFavorited ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorited ? `⭐ ${t('favorited')}` : `☆ ${t('save')}`}
                  </button>
                )}
                {!isSpeaking ? (
                  <button 
                    className="btn btn-sm btn-outline-info"
                    onClick={() => speak(translatedText, TTS_LANG_CODES[targetLang])}
                    disabled={!translatedText || !ttsSupported}
                  >
                    🔊 {t('listen')}
                  </button>
                ) : (
                  <button className="btn btn-sm btn-info" onClick={stopSpeaking}>
                    <span className="sound-wave">
                      <span></span><span></span><span></span>
                    </span>
                    {t('stop')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-primary btn-lg w-100 mt-4 shadow" 
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
        ) : t('translate_now')}
      </button>
    </div>
  );
};

export default Home;
