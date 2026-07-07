import { Request } from 'express';

export interface JWTPayload {
  id: string;
  username?: string;
  email?: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
