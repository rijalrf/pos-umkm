import { AuthRepository } from './auth.repository';
import { LoginInput } from './auth.schema';
import { LoginResponse } from './auth.types';
import { comparePassword } from '../../shared/utils/bcrypt.util';
import { signToken } from '../../shared/utils/jwt.util';

export class AuthService {
  private authRepository = new AuthRepository();

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.authRepository.findByUsername(input.username);
    if (!user) {
      const err = new Error('Invalid username or password');
      (err as any).statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('User account is inactive');
      (err as any).statusCode = 403;
      throw err;
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      const err = new Error('Invalid username or password');
      (err as any).statusCode = 401;
      throw err;
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user || !user.isActive) {
      const err = new Error('User not found or inactive');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
