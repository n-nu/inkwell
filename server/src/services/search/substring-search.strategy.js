import PostRepository from '../../repositories/post.repository.js';

const postRepository = new PostRepository();

export const SubstringSearchStrategy = {
  async search(query, { page = 1, pageSize = 10 } = {}) {
    return postRepository.searchPublished({
      query,
      page,
      pageSize,
    });
  },
};

export default SubstringSearchStrategy;
