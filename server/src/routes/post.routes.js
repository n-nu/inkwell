import express from 'express';
import PostService from '../services/post.service.js';
import TokenService from '../services/token.service.js';
import UserRepository from '../repositories/user.repository.js';
import { getPublishedPostCount } from '../events/listeners/published-post-stats.listener.js';

const router = express.Router();
const postService = new PostService();
const tokenService = new TokenService();
const userRepository = new UserRepository();

function sendError(res, error) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: { code: error.code, message: error.message } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      error: { code: 'MISSING_AUTHORIZATION', message: 'Authorization header is required.' },
    });
  }

  try {
    const payload = tokenService.verifyAccessToken(match[1]);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Session user no longer exists.' },
      });
    }

    req.user = { id: user.id, email: user.email };
    return next();
  } catch {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired access token.' },
    });
  }
}

router.post('/posts', requireAuth, async (req, res) => {
  try {
    const post = await postService.publish({
      ...req.body,
      authorId: req.user.id,
    });
    return res.status(201).json(post);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/posts', async (req, res) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error: { code: 'INVALID_PAGE', message: 'Page must be a positive integer.' },
    });
  }

  try {
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    if (searchQuery) {
      const result = await postService.search({ query: searchQuery, page });
      return res.status(200).json(result);
    }

    const result = await postService.listPublished({ page });
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/stats', (_req, res) => {
  res.status(200).json({ totalPostsPublished: getPublishedPostCount() });
});

export default router;