import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};
const mockTokenService = {
  issueTokens: jest.fn(),
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

const {
  AuthService,
  EmailAlreadyRegisteredError,
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
});
