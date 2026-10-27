import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../db/client.js';
import { resetDatabase } from '../../test-utils/fixtures.js';

const password = 'correcthorse';

beforeEach(async () => {
  await resetDatabase();
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

    expect(registration.body.user.email).toBe('writer@example.com');
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
});
