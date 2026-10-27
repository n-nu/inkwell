import { randomUUID } from 'node:crypto';
import { devices, expect, test } from '@playwright/test';

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

for (const { name, viewport } of viewports) {
  test(`registers, logs in, and publishes at ${name}`, async ({ page, request }) => {
    const runId = `${Date.now()}-${randomUUID()}`;
    const appUrl = test.info().project.use.baseURL;
    const email = `e2e-${name}-${runId}@example.com`;
    const title = `Hello from ${name} (${runId})`;
    const password = 'workshop-e2e-password';

    const registration = await request.post('http://localhost:4000/api/auth/register', {
      data: {
        email,
        displayName: `E2E ${name}`,
        password,
      },
    });
    expect(registration.status()).toBe(201);
    const registeredUser = await registration.json();
    expect(registeredUser.user.id).toEqual(expect.any(String));

    await page.setViewportSize(viewport);
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(`${appUrl}/`);

    await page.getByRole('link', { name: 'Write' }).click();
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
