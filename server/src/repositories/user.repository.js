import { prisma } from '../db/client.js';

export class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create({ email, displayName, passwordHash }) {
    return prisma.user.create({
      data: { email, displayName, passwordHash },
    });
  }
}

export default UserRepository;