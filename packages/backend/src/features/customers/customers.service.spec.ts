import { CustomersService } from './customers.service';
import { prisma } from '../../config/database.config';
import { EmailService } from '../../shared/services/email.service';

// Mock dependecies
jest.mock('../../config/database.config', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(EmailService.prototype, 'sendVerificationEmail').mockResolvedValue({ messageId: 'test-email-id' } as any);
    service = new CustomersService();
  });

  describe('register', () => {
    it('should create a customer and send email verify token', async () => {
      const mockCustomerInput = {
        email: 'member@example.com',
        password: 'password123',
        name: 'Member Baru',
        phone: '0812345678',
        address: 'Jl. Melati No. 1',
      };

      const mockCreatedCustomer = {
        id: 'cust-uuid',
        email: 'member@example.com',
        passwordHash: 'hashedpassword',
        name: 'Member Baru',
        phone: '0812345678',
        address: 'Jl. Melati No. 1',
        isEmailVerified: false,
        emailVerifyToken: 'verifytoken123',
        emailVerifyExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCreatedCustomer);

      const result = await service.register(mockCustomerInput);

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({ where: { email: mockCustomerInput.email } });
      expect(prisma.customer.create).toHaveBeenCalled();
      expect(result.email).toBe(mockCustomerInput.email);
      expect(result.isEmailVerified).toBe(false);
    });

    it('should throw error if email already exists', async () => {
      const mockCustomerInput = {
        email: 'member@example.com',
        password: 'password123',
        name: 'Member Baru',
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(service.register(mockCustomerInput)).rejects.toThrow('Email already registered');
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email and clear token if valid and not expired', async () => {
      const mockCustomer = {
        id: 'cust-uuid',
        email: 'member@example.com',
        isEmailVerified: false,
        emailVerifyToken: 'validtoken',
        emailVerifyExpiry: new Date(Date.now() + 3600000), // +1 hour
      };

      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.customer.update as jest.Mock).mockResolvedValue({ ...mockCustomer, isEmailVerified: true });

      await service.verifyEmail('validtoken');

      expect(prisma.customer.findUnique).toHaveBeenCalledWith({ where: { emailVerifyToken: 'validtoken' } });
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'cust-uuid' },
        data: {
          isEmailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
      });
    });

    it('should throw error if verification token is invalid', async () => {
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.verifyEmail('invalidtoken')).rejects.toThrow('Invalid verification token');
    });
  });
});
