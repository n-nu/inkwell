import PostRepository from '../repositories/post.repository.js';
import { assertNonEmpty } from '../utils/validation.js';

export class PostService {
  constructor(postRepository = new PostRepository()) {
    this.postRepository = postRepository;
  }

  async publish({ authorId, title, body } = {}) {
    assertNonEmpty(title, 'Title', 'INVALID_TITLE');
    assertNonEmpty(body, 'Body', 'INVALID_BODY');

    return this.postRepository.create({
      authorId,
      title: title.trim(),
      body: body.trim(),
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
  }

  async listPublished({ page = 1, pageSize = 10 } = {}) {
    const result = await this.postRepository.findPublished({ page, pageSize });
    return { ...result, page };
  }
}

export default PostService;