import express from 'express';
import './events/listeners/log-published-posts.listener.js';
import './events/listeners/published-post-stats.listener.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', postRoutes);

app.get('/api/version', (_req, res) => {
  res.status(200).json({
    version: '0.1.0',
  });
});

app.use(errorHandler);
