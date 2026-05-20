const axios = require('axios');

(async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:9000' });
    let token = '';
    
    // login or register
    try {
      const res = await api.post('/api/auth/register', { name: 'test', email: 'test@test.com', password: 'password123' });
      token = res.data.token;
    } catch (e) {
      const res = await api.post('/api/auth/login', { email: 'test@test.com', password: 'password123' });
      token = res.data.token;
    }
    
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    
    const text = 'likitha likitha likitha likitha likitha likitha likitha';
    console.log('Sending translate request...');
    const translateRes = await api.post('/api/translate', { text, sourceLang: 'auto', targetLang: 'es' });
    console.log('Translate Result:', translateRes.data);
    
    const favCheckUrl = `/api/favorites/check?inputText=${encodeURIComponent(text)}&translatedText=${encodeURIComponent(translateRes.data.translatedText)}`;
    console.log('Fav Check URL:', favCheckUrl);
    const favRes = await api.get(favCheckUrl);
    console.log('Fav Check Result:', favRes.data);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
})();
