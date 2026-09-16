import express from 'express';
import 'dotenv/config';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', postRoutes);

app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '0.1.0',
  });
});

app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});
