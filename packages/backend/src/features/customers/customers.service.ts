import crypto from 'crypto';
import { CustomersRepository } from './customers.repository';
import { RegisterCustomerInput, LoginCustomerInput } from './customers.schema';
import { CustomerPayload, CustomerAuthResponse } from './customers.types';
import { hashPassword, comparePassword } from '../../shared/utils/bcrypt.util';
import { signToken } from '../../shared/utils/jwt.util';
import { EmailService } from '../../shared/services/email.service';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../shared/utils/errors.util';
import { logger } from '../../shared/utils/logger.util';

export class CustomersService {
  private repository = new CustomersRepository();
  private emailService = new EmailService();

  async register(input: RegisterCustomerInput['body']): Promise<CustomerPayload> {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    
    // Generate verification token and 24h expiry
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date();
    emailVerifyExpiry.setHours(emailVerifyExpiry.getHours() + 24);

    const customer = await this.repository.create({
      ...input,
      passwordHash,
      emailVerifyToken,
      emailVerifyExpiry,
    });

    // Send verification email in background (don't block the API response, but log any error)
    this.emailService.sendVerificationEmail(customer.email, customer.name, emailVerifyToken)
      .catch(err => {
        logger.error(`Failed to send verification email to ${customer.email}:`, err);
      });

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      isEmailVerified: customer.isEmailVerified,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const customer = await this.repository.findByVerifyToken(token);
    if (!customer) {
      throw new NotFoundError('Invalid verification token');
    }

    if (customer.emailVerifyExpiry && new Date() > customer.emailVerifyExpiry) {
      throw new BadRequestError('Verification token has expired. Please register again.');
    }

    await this.repository.update(customer.id, {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    });
  }

  async login(input: LoginCustomerInput['body']): Promise<CustomerAuthResponse> {
    const customer = await this.repository.findByEmail(input.email);
    if (!customer) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!customer.isEmailVerified) {
      throw new BadRequestError('Email not verified. Please verify your email before logging in.');
    }

    const token = signToken({
      id: customer.id,
      email: customer.email,
      fullName: customer.name,
      role: 'CUSTOMER',
    });

    return {
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        isEmailVerified: customer.isEmailVerified,
      },
    };
  }

  async getProfile(id: string): Promise<CustomerPayload> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      isEmailVerified: customer.isEmailVerified,
    };
  }

  async getMyTransactions(customerId: string) {
    const customer = await this.repository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return this.repository.findTransactionsByCustomerId(customerId);
  }

  async findByPhone(phone: string): Promise<CustomerPayload | null> {
    const customer = await this.repository.findByPhone(phone);
    if (!customer) return null;
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      isEmailVerified: customer.isEmailVerified,
    };
  }

  async listAll(): Promise<CustomerPayload[]> {
    const list = await this.repository.findAll();
    return list.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      isEmailVerified: customer.isEmailVerified,
    }));
  }
}
