import { useState, useEffect, useRef } from 'react';

export const SPEECH_LANG_CODES = {
  auto: 'en-US',
  en: 'en-US',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ar: 'ar-SA',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ru: 'ru-RU',
  pt: 'pt-BR'
};

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startListening = (languageCode = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError('');
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Keep listening until user stops
    recognition.interimResults = true; // Show results as user speaks
    recognition.lang = languageCode;

    recognition.onstart = () => setListening(true);
    
    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  return {
    transcript,
    listening,
    supported,
    error,
    startListening,
    stopListening,
    setTranscript
  };
};

export default useSpeechRecognition;
