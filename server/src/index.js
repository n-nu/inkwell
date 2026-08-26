import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'inkwell-api',
  });
});

app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '0.1.0',
  });
});

app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});
