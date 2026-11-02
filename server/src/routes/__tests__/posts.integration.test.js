import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../db/client.js';
import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { MAX_PAGE_SIZE } from '../post.routes.js';
import { resetDatabase } from '../../test-utils/fixtures.js';

const password = 'correcthorse';

beforeEach(async () => {
  await resetDatabase();
  for (const address of ['::1', '127.0.0.1', '::ffff:127.0.0.1']) {
    authRateLimiter.resetKey(address);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('HTTP integration', () => {
  test('registers, publishes a tagged post, and browses it', async () => {
    const registration = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'writer@example.com',
        displayName: 'Writer',
        password,
      })
      .expect(201);
    const author = registration.body.user;

    expect(author.email).toBe('writer@example.com');
    expect(registration.body.accessToken).toEqual(expect.any(String));

    const publish = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${registration.body.accessToken}`)
      .send({
        title: 'Integration testing',
        body: 'A real route through PostgreSQL.',
        tagNames: ['testing'],
      })
      .expect(201);

    expect(publish.body.title).toBe('Integration testing');

    const browse = await request(app)
      .get('/api/posts?page=1')
      .expect(200);

    expect(browse.body.posts).toHaveLength(1);
    expect(browse.body.posts[0].title).toBe('Integration testing');
    expect(browse.body.posts[0].tags.map(({ tag }) => tag.name)).toContain('testing');
    expect(browse.body.posts[0].author).toEqual({
      id: author.id,
      displayName: 'Writer',
    });
    expect(browse.body.posts[0].author).not.toHaveProperty('email');
    expect(browse.body.posts[0].author).not.toHaveProperty('passwordHash');

    const search = await request(app)
      .get('/api/posts?search=Integration')
      .expect(200);
    expect(search.body.posts[0].author).toEqual({
      id: author.id,
      displayName: 'Writer',
    });
    expect(search.body.posts[0].author).not.toHaveProperty('email');
    expect(search.body.posts[0].author).not.toHaveProperty('passwordHash');
  });

  test('rejects duplicate registration', async () => {
    const registration = {
      email: 'alice@example.com',
      displayName: 'Alice',
      password,
    };

    await request(app)
      .post('/api/auth/register')
      .send(registration)
      .expect(201);

    const duplicate = await request(app)
      .post('/api/auth/register')
      .send(registration)
      .expect(400);

    expect(duplicate.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  test('registers and logs in the same user', async () => {
    const credentials = {
      email: 'login@example.com',
      displayName: 'Login User',
      password,
    };

    const registration = await request(app)
      .post('/api/auth/register')
      .send(credentials)
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password })
      .expect(200);

    expect(login.body.user).toMatchObject({
      id: registration.body.user.id,
      email: credentials.email,
    });
    expect(login.body.accessToken).toEqual(expect.any(String));
    expect(login.body.refreshToken).toEqual(expect.any(String));
    expect(login.body.user).not.toHaveProperty('passwordHash');
  });

  test('requires a valid bearer token and ignores a spoofed post author', async () => {
    const alice = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', displayName: 'Alice', password })
      .expect(201);
    const bob = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', displayName: 'Bob', password })
      .expect(201);

    const unauthenticated = await request(app)
      .post('/api/posts')
      .send({ title: 'No token', body: 'Should not publish.' })
      .expect(401);
    expect(unauthenticated.body.error.code).toBe('UNAUTHENTICATED');

    const invalidToken = await request(app)
      .post('/api/posts')
      .set('Authorization', 'Bearer invalid-token')
      .send({ title: 'Bad token', body: 'Should not publish.' })
      .expect(401);
    expect(invalidToken.body.error.code).toBe('UNAUTHENTICATED');

    const expiredToken = jwt.sign(
      { sub: alice.body.user.id },
      process.env.ACCESS_TOKEN_SECRET || 'development-access-secret',
      { expiresIn: -1 },
    );
    const expired = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ title: 'Expired token', body: 'Should not publish.' })
      .expect(401);
    expect(expired.body.error.code).toBe('UNAUTHENTICATED');

    const malformedHeader = await request(app)
      .post('/api/posts')
      .set('Authorization', 'Basic invalid-token')
      .send({ title: 'Malformed auth', body: 'Should not publish.' })
      .expect(401);
    expect(malformedHeader.body.error.code).toBe('UNAUTHENTICATED');

    const publish = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${alice.body.accessToken}`)
      .send({
        title: 'Identity comes from the token',
        body: 'A client cannot choose another author.',
        authorId: bob.body.user.id,
      })
      .expect(201);

    expect(publish.body.authorId).toBe(alice.body.user.id);
    expect(publish.body.authorId).not.toBe(bob.body.user.id);
  });

  test('clamps oversized pageSize for feed and search and rejects invalid values', async () => {
    const registration = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pagination@example.com', displayName: 'Pagination', password })
      .expect(201);

    await prisma.post.createMany({
      data: Array.from({ length: MAX_PAGE_SIZE + 1 }, (_, index) => ({
        authorId: registration.body.user.id,
        title: `Pagination sample ${index}`,
        body: 'Shared search phrase.',
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - index),
      })),
    });

    const feed = await request(app)
      .get('/api/posts?pageSize=100000')
      .expect(200);
    expect(feed.body.posts).toHaveLength(MAX_PAGE_SIZE);

    const search = await request(app)
      .get('/api/posts?search=Shared&pageSize=100000')
      .expect(200);
    expect(search.body.posts).toHaveLength(MAX_PAGE_SIZE);

    for (const pageSize of ['0', '-1', '1.5', 'not-a-number']) {
      const response = await request(app)
        .get(`/api/posts?pageSize=${encodeURIComponent(pageSize)}`)
        .expect(400);
      expect(response.body.error.code).toBe('INVALID_PAGE_SIZE');
    }

    await request(app)
      .get('/api/posts?page=999999999999999999999999')
      .expect(400);
  });

  test('rate limits repeated authentication attempts', async () => {
    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password }));
    }

    for (const response of responses.slice(0, 5)) {
      expect(response.status).toBe(401);
    }
    expect(responses[5].status).toBe(429);
    expect(responses[5].body.error.code).toBe('TOO_MANY_ATTEMPTS');
  });
});
