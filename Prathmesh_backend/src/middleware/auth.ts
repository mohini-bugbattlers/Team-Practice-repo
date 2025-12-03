import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/mysql';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    // Verify token using AuthService
    const result = await authService.verifyToken(token);

    if (result.success) {
      const userData = result.data;

      // For company users, get company ID from database
      if (userData.role === 'company') {
        const [companyRows] = await db.execute(
          'SELECT id FROM companies WHERE email = ?',
          [userData.email]
        );
        const companies = companyRows as any[];
        if (companies.length > 0) {
          userData.companyId = companies[0].id;
        }
      }

      req.user = userData;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
