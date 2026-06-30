import { AuthService } from './auth.service';
import { prisma } from '../../config/database.config';
import { comparePassword } from '../../shared/utils/bcrypt.util';
import { signToken } from '../../shared/utils/jwt.util';

const mockUser = {
  id: '15934e8c-182d-4c68-bee6-b0b676dad96a',
  username: 'admin',
  passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
  fullName: 'Administrator',
  role: 'ADMIN' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../shared/utils/bcrypt.util', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock('../../shared/utils/jwt.util', () => ({
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('login', () => {
    it('should successfully authenticate user with correct credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await authService.login({
        username: 'admin',
        password: 'admin123',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'admin' },
      });
      expect(comparePassword).toHaveBeenCalledWith('admin123', mockUser.passwordHash);
      expect(signToken).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        fullName: mockUser.fullName,
        role: mockUser.role,
      });
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          fullName: mockUser.fullName,
          role: mockUser.role,
        },
      });
    });

    it('should throw error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          username: 'invalid',
          password: 'password',
        })
      ).rejects.toThrow('Invalid username or password');
    });

    it('should throw error if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          username: 'admin',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid username or password');
    });

    it('should throw error if user account is inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        authService.login({
          username: 'admin',
          password: 'admin123',
        })
      ).rejects.toThrow('User account is inactive');
    });
  });
});
