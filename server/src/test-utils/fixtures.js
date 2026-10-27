import bcrypt from 'bcrypt';
import { prisma } from '../db/client.js';

let userCounter = 0;

export async function createTestUser({
  email,
  password = 'correcthorse',
} = {}) {
  userCounter += 1;
  const resolvedEmail = email ?? `test-user-${userCounter}@example.com`;
  const passwordHash = await bcrypt.hash(password, 4);

  return prisma.user.create({
    data: {
      email: resolvedEmail,
      displayName: 'Test User',
      passwordHash,
      isVerified: true,
    },
  });
}

export async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must point to inkwell_test before resetting test data.');
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
  } catch (error) {
    throw new Error('DATABASE_URL must be a valid URL before resetting test data.', { cause: error });
  }

  if (databaseName !== 'inkwell_test') {
    throw new Error(`Refusing to reset database "${databaseName}"; expected "inkwell_test".`);
  }

  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}
