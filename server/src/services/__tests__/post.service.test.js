import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { ValidationError } from '../../utils/validation.js';

const mockPostRepository = {
  createWithTags: jest.fn(),
};
const mockEventBus = {
  emit: jest.fn(),
};
const mockSearchStrategy = {
  search: jest.fn(),
};

jest.unstable_mockModule('../../repositories/post.repository.js', () => ({
  default: function MockPostRepository() {
    return mockPostRepository;
  },
}));
jest.unstable_mockModule('../../events/event-bus.js', () => ({
  EventBus: mockEventBus,
}));
jest.unstable_mockModule('../search/substring-search.strategy.js', () => ({
  default: mockSearchStrategy,
}));

const { PostService } = await import('../post.service.js');

let service;

beforeEach(() => {
  jest.resetAllMocks();
  service = new PostService();
});

describe('PostService.publish', () => {
  test('creates a PUBLISHED post and emits post.published', async () => {
    const publishedPost = { id: 'p1', title: 'Hello', status: 'PUBLISHED' };
    mockPostRepository.createWithTags.mockResolvedValue(publishedPost);

    const post = await service.publish({
      authorId: 'u1',
      title: 'Hello',
      body: 'World',
      tagNames: [' design ', ''],
    });

    expect(post).toEqual(publishedPost);
    expect(post.status).toBe('PUBLISHED');
    expect(mockPostRepository.createWithTags).toHaveBeenCalledTimes(1);
    expect(mockPostRepository.createWithTags).toHaveBeenCalledWith(expect.objectContaining({
      authorId: 'u1',
      title: 'Hello',
      body: 'World',
      status: 'PUBLISHED',
      tagNames: ['design'],
    }));
    expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'post.published',
      expect.objectContaining({
        postId: 'p1',
        authorId: 'u1',
        title: 'Hello',
        tags: ['design'],
      }),
    );
  });

  test('rejects an empty title without persistence or event side effects', async () => {
    await expect(service.publish({ authorId: 'u1', title: '', body: 'World' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(mockPostRepository.createWithTags).not.toHaveBeenCalled();
    expect(mockEventBus.emit).not.toHaveBeenCalled();
  });
});

describe('PostService.search', () => {
  test('returns matching posts for a normal query (S1)', async () => {
    const result = {
      posts: [{ id: 'p1', title: 'Modularity', status: 'PUBLISHED' }],
      hasMore: false,
    };
    mockSearchStrategy.search.mockResolvedValue(result);

    await expect(service.search({ query: 'modularity', page: 1, pageSize: 10 }))
      .resolves.toEqual(result);
    expect(mockSearchStrategy.search).toHaveBeenCalledTimes(1);
    expect(mockSearchStrategy.search).toHaveBeenCalledWith('modularity', {
      page: 1,
      pageSize: 10,
    });
  });

  test('defaults to page 1 and pageSize 10 (S2)', async () => {
    const result = { posts: [{ id: 'p2', title: 'Design' }], hasMore: false };
    mockSearchStrategy.search.mockResolvedValue(result);

    await expect(service.search({ query: 'design' })).resolves.toEqual(result);
    expect(mockSearchStrategy.search).toHaveBeenCalledTimes(1);
    expect(mockSearchStrategy.search).toHaveBeenCalledWith('design', {
      page: 1,
      pageSize: 10,
    });
  });

  test('forwards explicit pagination and preserves hasMore (S3)', async () => {
    const result = { posts: [{ id: 'p3', title: 'Design patterns' }], hasMore: true };
    mockSearchStrategy.search.mockResolvedValue(result);

    await expect(service.search({ query: 'design', page: 2, pageSize: 5 }))
      .resolves.toEqual(result);
    expect(mockSearchStrategy.search).toHaveBeenCalledTimes(1);
    expect(mockSearchStrategy.search).toHaveBeenCalledWith('design', {
      page: 2,
      pageSize: 5,
    });
  });

  test('returns an empty result without error when nothing matches (S4)', async () => {
    const result = { posts: [], hasMore: false };
    mockSearchStrategy.search.mockResolvedValue(result);

    await expect(service.search({ query: 'no-match', page: 1, pageSize: 10 }))
      .resolves.toEqual({ posts: [], hasMore: false });
    expect(mockSearchStrategy.search).toHaveBeenCalledTimes(1);
    expect(mockSearchStrategy.search).toHaveBeenCalledWith('no-match', {
      page: 1,
      pageSize: 10,
    });
  });
});
