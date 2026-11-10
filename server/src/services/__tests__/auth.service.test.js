import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};
const mockTokenService = {
  issueTokens: jest.fn(),
};
const mockLogger = {
  warn: jest.fn(),
};

jest.unstable_mockModule('../../repositories/user.repository.js', () => ({
  default: function MockUserRepository() {
    return mockUserRepository;
  },
}));
jest.unstable_mockModule('../token.service.js', () => ({
  default: function MockTokenService() {
    return mockTokenService;
  },
}));
jest.unstable_mockModule('../../lib/logger.js', () => ({
  logger: mockLogger,
}));

const {
  AuthService,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  WeakPasswordError,
  ValidationError,
} = await import('../auth.service.js');

let service;
let input;
let storedUser;

beforeEach(() => {
  jest.resetAllMocks();
  input = {
    email: 'alice@example.com',
    displayName: 'Alice',
    password: 'correcthorse',
  };
  storedUser = {
    id: 'u1',
    email: input.email,
    displayName: input.displayName,
    passwordHash: 'stored-password-hash',
  };
  mockUserRepository.findByEmail.mockResolvedValue(null);
  mockUserRepository.create.mockResolvedValue(storedUser);
  mockTokenService.issueTokens.mockReturnValue({
    accessToken: 'fake-access',
    refreshToken: 'fake-refresh',
  });
  service = new AuthService();
});

describe('AuthService.register', () => {
  test('creates a public user and returns tokens for valid input (row 1)', async () => {
    const result = await service.register(input);

    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      user: { id: 'u1', email: input.email, displayName: 'Alice' },
      accessToken: 'fake-access',
      refreshToken: 'fake-refresh',
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(mockTokenService.issueTokens).toHaveBeenCalledWith(storedUser);
  });

  test('rejects an already-registered email (row 2)', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(storedUser);

    await expect(service.register(input)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });

  test('rejects a password of exactly 7 characters (row 3)', async () => {
    await expect(service.register({ ...input, password: '1234567' }))
      .rejects.toBeInstanceOf(WeakPasswordError);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });

  test('accepts a password of exactly 8 characters (row 4)', async () => {
    const result = await service.register({ ...input, password: '12345678' });

    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    expect(result.user.id).toBe('u1');
    expect(result.accessToken).toBe('fake-access');
    expect(result.refreshToken).toBe('fake-refresh');
  });

  test('rejects a missing email before accessing the repository (row 5)', async () => {
    await expect(service.register({ ...input, email: '' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });

  test('converts a repository duplicate-key race into EmailAlreadyRegisteredError (row 6)', async () => {
    const duplicateError = Object.assign(new Error('Unique constraint failed on email'), {
      code: 'P2002',
    });
    mockUserRepository.create.mockRejectedValue(duplicateError);

    await expect(service.register(input)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });

  test('preserves unrelated repository failures rather than reporting a duplicate email', async () => {
    const repositoryError = new Error('Database unavailable');
    mockUserRepository.create.mockRejectedValue(repositoryError);

    await expect(service.register(input)).rejects.toBe(repositoryError);
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });

  test('logs failed login with safe structured metadata', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(service.login({
      email: '  MISSING@example.com ',
      password: 'secret-password',
    })).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      { event: 'auth.login.failed', email: 'missing@example.com' },
      'Failed login attempt',
    );
    expect(JSON.stringify(mockLogger.warn.mock.calls)).not.toContain('secret-password');
  });
});

describe('AuthService.login bcrypt compatibility', () => {
  const legacyPassword = 'workshop-18-compatibility';
  // Generated with bcrypt 5.1.1 before upgrading to bcrypt 6.
  const legacyHash = '$2b$10$C7HUksN7kFMVtqH2qNtOqeX6XZqo/wlPGu/RcqDynkmRxUKAL5A3y';

  beforeEach(() => {
    mockUserRepository.findByEmail.mockResolvedValue({
      ...storedUser,
      passwordHash: legacyHash,
    });
  });

  test('authenticates an existing bcrypt 5 password hash without exposing it', async () => {
    const result = await service.login({ email: input.email, password: legacyPassword });

    expect(result.user.id).toBe(storedUser.id);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toBe('fake-access');
    expect(result.refreshToken).toBe('fake-refresh');
  });

  test('rejects an incorrect password against an existing bcrypt 5 hash', async () => {
    await expect(service.login({ email: input.email, password: 'incorrect-password' }))
      .rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(mockTokenService.issueTokens).not.toHaveBeenCalled();
  });
});
