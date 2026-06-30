import { UsersService } from './users.service';
import { prisma } from '../../config/database.config';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.util';
import { Role } from '@prisma/client';

const mockUser = {
  id: '15934e8c-182d-4c68-bee6-b0b676dad96a',
  username: 'kasir1',
  passwordHash: '$2a$10$hashedpasswordstringhere',
  fullName: 'Kasir Satu',
  role: Role.CASHIER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('../../config/database.config', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../../shared/utils/bcrypt.util', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService();
  });

  describe('getAllUsers', () => {
    it('should return list of all users without password hashes', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0].username).toBe(mockUser.username);
    });
  });

  describe('getUserById', () => {
    it('should return user by id without password hash', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should create user successfully with hashed password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-pass');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed-pass',
      });

      const input = {
        username: 'kasir1',
        password: 'password123',
        fullName: 'Kasir Satu',
        role: Role.CASHIER,
      };

      const result = await service.createUser(input);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: input.username },
      });
      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw error if username already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const input = {
        username: 'kasir1',
        password: 'password123',
        fullName: 'Kasir Satu',
        role: Role.CASHIER,
      };

      await expect(service.createUser(input)).rejects.toThrow('Username already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user without changing password if not provided', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // exists check
        .mockResolvedValueOnce(null); // duplicate username check
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.updateUser(mockUser.id, {
        fullName: 'Kasir Baru',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          fullName: 'Kasir Baru',
          username: undefined,
          role: undefined,
          isActive: undefined,
        },
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should hash and update password if password is provided', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      (hashPassword as jest.Mock).mockResolvedValue('new-hashed-pass');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: 'new-hashed-pass',
      });

      await service.updateUser(mockUser.id, {
        password: 'newpassword123',
      });

      expect(hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          passwordHash: 'new-hashed-pass',
        }),
      });
    });
  });

  describe('changePassword', () => {
    it('should update current user password successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue('new-hashed-pass');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await service.changePassword(mockUser.id, {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(comparePassword).toHaveBeenCalledWith('oldpassword', mockUser.passwordHash);
      expect(hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: 'new-hashed-pass' },
      });
    });

    it('should throw error if current password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow('Invalid current password');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.deleteUser(mockUser.id, 'another-admin-id');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result.id).toBe(mockUser.id);
    });

    it('should prevent deleting own user account', async () => {
      await expect(service.deleteUser(mockUser.id, mockUser.id)).rejects.toThrow(
        'Cannot delete your own user account'
      );
    });
  });
});
