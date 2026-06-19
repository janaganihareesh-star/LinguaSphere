import { useState } from 'react';

export const TTS_LANG_CODES = {
  auto: 'en',
  en: 'en',
  te: 'te',
  hi: 'hi',
  ta: 'ta',
  ml: 'ml',
  kn: 'kn',
  mr: 'mr',
  bn: 'bn',
  gu: 'gu',
  pa: 'pa',
  ar: 'ar',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh-CN',
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

    // Use our backend TTS proxy via API instance — bypasses CORS and dynamically uses baseURL
    import('../services/api').then(({ default: api }) => {
      api.get(`/api/translate/tts?text=${encodeURIComponent(text)}&lang=${shortLang}`, {
        responseType: 'blob'
      })
        .then(res => {
          const url = URL.createObjectURL(res.data);
          audio.src = url;
          audio.load();
        })
        .catch(() => {
          setIsSpeaking(false);
          fallbackBrowserTTS(text, langCode);
        });
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
