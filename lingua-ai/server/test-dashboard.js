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
    
    console.log('Testing /api/translate/stats...');
    try {
      const statsRes = await api.get('/api/translate/stats');
      console.log('Stats Result:', statsRes.data);
    } catch (err) {
      console.error('Stats Error:', err.response ? err.response.data : err.message);
    }

    console.log('Testing /api/translate/history...');
    try {
      const historyRes = await api.get('/api/translate/history');
      console.log('History Result (count):', historyRes.data.count);
    } catch (err) {
      console.error('History Error:', err.response ? err.response.data : err.message);
    }

    console.log('Testing /api/favorites...');
    try {
      const favRes = await api.get('/api/favorites');
      console.log('Favorites Result (count):', favRes.data.count);
    } catch (err) {
      console.error('Favorites Error:', err.response ? err.response.data : err.message);
    }

  } catch (err) {
    console.error('General Error:', err.message);
  }
})();
