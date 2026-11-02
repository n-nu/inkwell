import PostRepository from '../repositories/post.repository.js';
import { EventBus } from '../events/event-bus.js';
import { assertNonEmpty } from '../utils/validation.js';
import SubstringSearchStrategy from './search/substring-search.strategy.js';
import { toPublicUser } from '../dto/user.dto.js';

const searchStrategy = SubstringSearchStrategy;

function shapePostAuthors(result) {
  return {
    ...result,
    posts: result.posts.map(({ author, ...post }) => ({
      ...post,
      author: toPublicUser(author),
    })),
  };
}

export class PostService {
  constructor(postRepository = new PostRepository()) {
    this.postRepository = postRepository;
  }

  async publish({ authorId, title, body, tagNames = [] } = {}) {
    assertNonEmpty(title, 'Title', 'INVALID_TITLE');
    assertNonEmpty(body, 'Body', 'INVALID_BODY');

    const normalizedTagNames = Array.isArray(tagNames)
      ? tagNames.map((tagName) => String(tagName).trim()).filter(Boolean)
      : [];

    const post = await this.postRepository.createWithTags({
      authorId,
      title: title.trim(),
      body: body.trim(),
      status: 'PUBLISHED',
      publishedAt: new Date(),
      tagNames: normalizedTagNames,
    });

    EventBus.emit('post.published', {
      postId: post.id,
      authorId,
      title: post.title,
      tags: normalizedTagNames,
    });

    return post;
  }

  async getById(id) {
    return this.postRepository.findById(id);
  }

  async delete(id) {
    return this.postRepository.deleteById(id);
  }

  async listPublished({ page = 1, pageSize = 10 } = {}) {
    const result = await this.postRepository.findPublished({ page, pageSize });
    return { ...shapePostAuthors(result), page };
  }

  async search({ query, page = 1, pageSize = 10 } = {}) {
    const result = await searchStrategy.search(query, {
      page,
      pageSize,
    });
    return shapePostAuthors(result);
  }
}

export default PostService;