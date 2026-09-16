import express from 'express';
import PostService from '../services/post.service.js';

const router = express.Router();
const postService = new PostService();

function sendError(res, error) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: { code: error.code, message: error.message } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}

router.post('/posts', async (req, res) => {
  try {
    const post = await postService.publish(req.body);
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
    const result = await postService.listPublished({ page });
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;