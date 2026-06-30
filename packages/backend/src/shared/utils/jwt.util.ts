import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';

export interface JWTPayload {
  id: string;
  username?: string;
  email?: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.jwtSecret) as JWTPayload;
};
