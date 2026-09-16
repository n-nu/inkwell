import bcrypt from 'bcrypt';
import UserRepository from '../repositories/user.repository.js';
import { assertNonEmpty } from '../utils/validation.js';
import TokenService from './token.service.js';

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('This email is already registered.');
    this.name = 'EmailAlreadyRegisteredError';
    this.code = 'EMAIL_ALREADY_REGISTERED';
  }
}

export class WeakPasswordError extends Error {
  constructor() {
    super('Password does not meet strength requirements.');
    this.name = 'WeakPasswordError';
    this.code = 'WEAK_PASSWORD';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
    this.code = 'INVALID_CREDENTIALS';
  }
}

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

function isDuplicateEmailError(error) {
  return error?.code === 'P2002' || error?.constraint === 'email';
}

export class AuthService {
  constructor(userRepository = new UserRepository(), tokenService = new TokenService()) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async register({ email, displayName, password } = {}) {
    assertNonEmpty(email, 'Email', 'INVALID_EMAIL');
    assertNonEmpty(displayName, 'Display name', 'INVALID_DISPLAY_NAME');
    assertNonEmpty(password, 'Password', 'INVALID_PASSWORD');

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }

    if (password.length < 8) {
      throw new WeakPasswordError();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await this.userRepository.create({
        email: normalizedEmail,
        displayName: displayName.trim(),
        passwordHash,
      });
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }

    return {
      user: toPublicUser(user),
      ...this.tokenService.issueTokens(user),
    };
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(
      typeof email === 'string' ? email.trim().toLowerCase() : email,
    );
    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    return {
      user: toPublicUser(user),
      ...this.tokenService.issueTokens(user),
    };
  }
}

export default AuthService;