import { useState } from 'react';

export const TTS_LANG_CODES = {
  auto: 'en',
  en: 'en',
  te: 'te',
  hi: 'hi',
  ta: 'ta',
  ml: 'ml',
  kn: 'kn',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ar: 'ar',
  zh: 'zh-CN',
  ja: 'ja',
  ru: 'ru',
  pt: 'pt'
};

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);

  const speak = (text, langCode = 'en') => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const token = localStorage.getItem('token');
    const shortLang = langCode.split('-')[0];

    // Use our backend TTS proxy — bypasses CORS completely
    const ttsUrl = `http://localhost:9000/api/translate/tts?text=${encodeURIComponent(text)}&lang=${shortLang}`;

    const audio = new Audio();
    setCurrentAudio(audio);

    audio.oncanplay = () => {
      setIsSpeaking(true);
      audio.play().catch(() => {
        setIsSpeaking(false);
        fallbackBrowserTTS(text, langCode);
      });
    };

    audio.onended = () => {
      setIsSpeaking(false);
      setCurrentAudio(null);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setCurrentAudio(null);
      fallbackBrowserTTS(text, langCode);
    };

    // Set auth header via fetch and create blob URL
    fetch(ttsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('TTS failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        audio.src = url;
        audio.load();
      })
      .catch(() => {
        setIsSpeaking(false);
        fallbackBrowserTTS(text, langCode);
      });
  };

  const fallbackBrowserTTS = (text, langCode) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { isSpeaking, supported, speak, stopSpeaking };
};

export default useTextToSpeech;
