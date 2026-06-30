import { Request } from 'express';
import { JWTPayload } from '../utils/jwt.util';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
