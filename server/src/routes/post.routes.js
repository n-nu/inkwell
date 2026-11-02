import express from 'express';
import PostService from '../services/post.service.js';
import { getPublishedPostCount } from '../events/listeners/published-post-stats.listener.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();
const postService = new PostService();
const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

router.post('/posts', requireAuth, async (req, res, next) => {
  try {
    const post = await postService.publish({
      ...req.body,
      authorId: req.user.id,
    });
    return res.status(201).json(post);
  } catch (error) {
    return next(error);
  }
});

router.delete('/posts/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await postService.getById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }

    await postService.delete(req.params.id);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

router.get('/posts', async (req, res) => {
  const pageValue = req.query.page ?? '1';
  const page = typeof pageValue === 'string' && /^[1-9]\d*$/.test(pageValue)
    ? Number(pageValue)
    : Number.NaN;
  if (!Number.isSafeInteger(page)) {
    return res.status(400).json({
      error: { code: 'INVALID_PAGE', message: 'Page must be a positive integer.' },
    });
  }

  let pageSize = DEFAULT_PAGE_SIZE;
  if (req.query.pageSize !== undefined) {
    if (typeof req.query.pageSize !== 'string' || !/^[1-9]\d*$/.test(req.query.pageSize)) {
      return res.status(400).json({
        error: { code: 'INVALID_PAGE_SIZE', message: 'Page size must be a positive integer.' },
      });
    }

    const requestedPageSize = Number(req.query.pageSize);
    if (!Number.isSafeInteger(requestedPageSize)) {
      return res.status(400).json({
        error: { code: 'INVALID_PAGE_SIZE', message: 'Page size must be a positive integer.' },
      });
    }

    pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  }

  if (!Number.isSafeInteger((page - 1) * pageSize)) {
    return res.status(400).json({
      error: { code: 'INVALID_PAGE', message: 'Page must be a positive integer.' },
    });
  }

  try {
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    if (searchQuery) {
      const result = await postService.search({ query: searchQuery, page, pageSize });
      return res.status(200).json(result);
    }

    const result = await postService.listPublished({ page, pageSize });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get('/stats', (_req, res) => {
  res.status(200).json({ totalPostsPublished: getPublishedPostCount() });
});

export default router;