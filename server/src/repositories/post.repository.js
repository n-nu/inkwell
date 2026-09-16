import { prisma } from '../db/client.js';

export class PostRepository {
  async create({ authorId, title, body, status, publishedAt }) {
    return prisma.post.create({
      data: { authorId, title, body, status, publishedAt },
    });
  }

  async findPublished({ page, pageSize }) {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { publishedAt: 'desc' },
        { id: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });

    return {
      posts: posts.slice(0, pageSize),
      hasMore: posts.length > pageSize,
    };
  }
}

export default PostRepository;