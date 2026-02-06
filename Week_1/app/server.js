const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Node.js App running inside Docker');
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
