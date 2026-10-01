import { prisma } from '../db/client.js';

export class PostRepository {
  async create({ authorId, title, body, status, publishedAt }) {
    return prisma.post.create({
      data: { authorId, title, body, status, publishedAt },
    });
  }

  async createWithTags({ authorId, title, body, status, publishedAt, tagNames = [] }) {
    const normalizedTagNames = [...new Set(
      (tagNames || [])
        .map((tagName) => String(tagName).trim().toLowerCase())
        .filter(Boolean),
    )];

    const post = await prisma.post.create({
      data: { authorId, title, body, status, publishedAt },
    });

    if (normalizedTagNames.length === 0) {
      return prisma.post.findUnique({
        where: { id: post.id },
        include: { tags: { include: { tag: true } } },
      });
    }

    const existingTags = await prisma.tag.findMany({
      where: { name: { in: normalizedTagNames } },
    });

    const existingTagNames = new Set(existingTags.map((tag) => tag.name));
    const newTagNames = normalizedTagNames.filter((tagName) => !existingTagNames.has(tagName));

    if (newTagNames.length > 0) {
      await prisma.tag.createMany({
        data: newTagNames.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }

    const allTags = await prisma.tag.findMany({
      where: { name: { in: normalizedTagNames } },
    });

    if (allTags.length > 0) {
      await prisma.postTag.createMany({
        data: allTags.map((tag) => ({
          postId: post.id,
          tagId: tag.id,
        })),
        skipDuplicates: true,
      });
    }

    return prisma.post.findUnique({
      where: { id: post.id },
      include: { tags: { include: { tag: true } } },
    });
  }

  async findPublished({ page, pageSize }) {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { publishedAt: 'desc' },
        { id: 'desc' },
      ],
      include: { tags: { include: { tag: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
    });

    return {
      posts: posts.slice(0, pageSize),
      hasMore: posts.length > pageSize,
    };
  }

  async searchPublished({ query, page, pageSize }) {
    const normalizedQuery = query.trim();
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { body: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { publishedAt: 'desc' },
        { id: 'desc' },
      ],
      include: { tags: { include: { tag: true } } },
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