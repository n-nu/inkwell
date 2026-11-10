import { randomUUID } from 'node:crypto';
import { devices, expect, request as apiRequest, test } from '@playwright/test';

const viewports = [
  {
    name: 'mobile',
    viewport: devices['iPhone 13'].viewport,
  },
  {
    name: 'tablet',
    viewport: {
      width: 768,
      height: 1024,
    },
  },
  {
    name: 'desktop',
    viewport: {
      width: 1280,
      height: 800,
    },
  },
];

test.describe('responsive publishing flow', () => {
  test.describe.configure({ mode: 'serial' });

  let runId;
  let email;
  let password;
  let registeredUser;

  test.beforeAll(async () => {
    runId = `${Date.now()}-${randomUUID()}`;
    email = `e2e-${runId}@example.com`;
    password = 'workshop-e2e-password';

    const apiContext = await apiRequest.newContext();
    try {
      const registration = await apiContext.post('http://localhost:4000/api/auth/register', {
        data: {
          email,
          displayName: 'E2E Writer',
          password,
        },
      });
      expect(registration.status()).toBe(201);
      registeredUser = await registration.json();
      expect(registeredUser.user.id).toEqual(expect.any(String));
    } finally {
      await apiContext.dispose();
    }
  });

  for (const { name, viewport } of viewports) {
    test(`logs in and publishes at ${name}`, async ({ page }) => {
      const appUrl = test.info().project.use.baseURL;
      const title = `Hello from ${name} (${runId})`;

      await page.setViewportSize(viewport);
      await page.goto('/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Log In' }).click();
      await expect(page).toHaveURL(`${appUrl}/`);

      await page.getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Write', exact: true }).click();
      const body = `Published from the ${name} viewport.`;
      await page.getByLabel('Title').fill(title);
      await page.getByLabel('Body').fill(body);
      const publishRequestPromise = page.waitForRequest((request) => (
        request.url().endsWith('/api/posts') && request.method() === 'POST'
      ));
      await page.getByRole('button', { name: 'Publish' }).click();
      const publishRequest = await publishRequestPromise;
      expect(publishRequest.postDataJSON()).toMatchObject({
        title,
        body,
        authorId: registeredUser.user.id,
      });
      expect(publishRequest.headers().authorization).toMatch(/^Bearer\s.+$/);

      await expect(page).toHaveURL(`${appUrl}/`);
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    });
  }
});
