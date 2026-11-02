import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../db/client.js';
import { createTestPost, createTestUser, resetDatabase, tokenFor } from '../../test-utils/fixtures.js';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('DELETE /api/posts/:id access control', () => {
  test('prevents a non-owner from deleting a post', async () => {
    const owner = await createTestUser();
    const attacker = await createTestUser();
    const post = await createTestPost(owner);

    const response = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${tokenFor(attacker)}`)
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
    await expect(prisma.post.findUnique({ where: { id: post.id } })).resolves.toBeTruthy();
  });

  test('allows the owner to delete a tagged post and cascades its tag relation', async () => {
    const owner = await createTestUser();
    const post = await createTestPost(owner);
    const tag = await prisma.tag.create({ data: { name: 'access-control-test' } });
    await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });

    await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`)
      .expect(204);

    await expect(prisma.post.findUnique({ where: { id: post.id } })).resolves.toBeNull();
    await expect(prisma.postTag.findMany({ where: { postId: post.id } })).resolves.toEqual([]);
  });

  test('requires authentication', async () => {
    const owner = await createTestUser();
    const post = await createTestPost(owner);

    const response = await request(app)
      .delete(`/api/posts/${post.id}`)
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    await expect(prisma.post.findUnique({ where: { id: post.id } })).resolves.toBeTruthy();
  });

  test('returns not found for a missing post', async () => {
    const user = await createTestUser();
    const response = await request(app)
      .delete('/api/posts/missing-post-id')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
