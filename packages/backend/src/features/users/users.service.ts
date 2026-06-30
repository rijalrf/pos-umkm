import { UsersRepository } from './users.repository';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput } from './users.schema';
import { UserWithoutPassword } from './users.types';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.util';
import { User } from '@prisma/client';

export class UsersService {
  private repository = new UsersRepository();

  private sanitizeUser(user: User): UserWithoutPassword {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.repository.findAll();
    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await this.repository.findById(id);
    if (!user) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return this.sanitizeUser(user);
  }

  async createUser(data: CreateUserInput): Promise<UserWithoutPassword> {
    const existing = await this.repository.findByUsername(data.username);
    if (existing) {
      const err = new Error('Username already exists');
      (err as any).statusCode = 400;
      throw err;
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.repository.create({
      username: data.username,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      role: data.role,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return this.sanitizeUser(user);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserWithoutPassword> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (data.username) {
      const duplicate = await this.repository.findByUsername(data.username);
      if (duplicate && duplicate.id !== id) {
        const err = new Error('Username already exists');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    const updateData: any = {
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const updated = await this.repository.update(id, updateData);
    return this.sanitizeUser(updated);
  }

  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const isPasswordValid = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      const err = new Error('Invalid current password');
      (err as any).statusCode = 400;
      throw err;
    }

    const newHashedPassword = await hashPassword(data.newPassword);
    await this.repository.update(userId, {
      passwordHash: newHashedPassword,
    });
  }

  async deleteUser(id: string, currentUserId: string): Promise<UserWithoutPassword> {
    if (id === currentUserId) {
      const err = new Error('Cannot delete your own user account');
      (err as any).statusCode = 400;
      throw err;
    }

    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const deleted = await this.repository.delete(id);
    return this.sanitizeUser(deleted);
  }
}
