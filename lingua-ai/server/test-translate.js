const axios = require('axios');

async function test() {
  try {
    const source = 'en';
    const targetLang = 'es';
    const text = 'likitha likitha likitha likitha likitha likitha likitha';
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    console.log('Fetching from:', url);
    const transRes = await axios.get(url, { timeout: 10000 });
    
    console.log('Status:', transRes.status);
    console.log('Data structure length:', transRes.data.length);
    console.log('Data:', JSON.stringify(transRes.data).substring(0, 200));

    const result = transRes.data[0]
      .filter(chunk => chunk && chunk[0])
      .map(chunk => chunk[0])
      .join('');
      
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
}

test();
