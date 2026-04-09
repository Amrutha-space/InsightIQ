const express = require('express');
const app = express();

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Proxy to main server
app.all('*', (req, res) => {
  const targetUrl = `http://localhost:5001${req.path}`;
  const axios = require('axios');
  
  axios({
    method: req.method,
    url: targetUrl,
    data: req.body,
    headers: req.headers
  }).then(response => {
    console.log('✅ Response:', response.status, response.data);
    res.status(response.status).json(response.data);
  }).catch(error => {
    console.log('❌ Error:', error.response?.status, error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data || {error: 'Proxy error'});
  });
});

app.listen(3000, () => {
  console.log('🔍 Request monitor running on port 3000');
  console.log('📡 Point your frontend to http://localhost:3000/api');
});
