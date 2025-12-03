import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../config/mysql';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../interfaces';

const authService = new AuthService();

// Signup validation rules
export const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['company']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('companyData.name').if(body('role').equals('company')).notEmpty().withMessage('Company name is required'),
  body('companyData.phone').if(body('role').equals('company')).notEmpty().withMessage('Company phone is required'),
  body('companyData.address').if(body('role').equals('company')).notEmpty().withMessage('Company address is required'),
  body('companyData.registration_number').if(body('role').equals('company')).notEmpty().withMessage('Company registration number is required')
];

// Login validation rules
export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Generic validation result handler
export const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(error => error.msg)
    } as ApiResponse);
    return false;
  }
  return true;
};

// Auth Controller
export class AuthController {
  static async login(req: Request, res: Response) {
    if (!handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    // Demo authentication - accept admin@prathmesh.com with any password
    if (email === 'admin@prathmesh.com') {
      const token = jwt.sign(
        {
          id: 1,
          email: 'admin@prathmesh.com',
          role: 'admin',
          name: 'Admin User'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: 1,
            email: 'admin@prathmesh.com',
            role: 'admin',
            name: 'Admin User'
          }
        }
      } as ApiResponse);
    }

    // Real authentication logic (if database is available)
    try {
      const result = await authService.login(req.body);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(401).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async signup(req: Request, res: Response) {
    if (!handleValidationErrors(req, res)) return;

    const { email, password, role, name, phone, companyData } = req.body;

    // Allow company signup without admin restriction
    if (role && !['company'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Only company accounts can be created through this endpoint'
      } as ApiResponse);
    }

    try {
      // If role is company, create company first
      let companyId = null;
      if (role === 'company') {
        if (!companyData) {
          return res.status(400).json({
            success: false,
            message: 'Company data is required for company signup'
          } as ApiResponse);
        }

        // Import CompanyService
        const { CompanyService } = require('../services/CompanyService');
        const companyService = new CompanyService();

        const companyResult = await companyService.createCompany({
          name: companyData.name,
          email: email,
          phone: companyData.phone,
          address: companyData.address,
          registration_number: companyData.registration_number,
          gst_number: companyData.gst_number
        });

        if (!companyResult.success) {
          return res.status(400).json({
            success: false,
            message: companyResult.message
          } as ApiResponse);
        }

        companyId = companyResult.data!.id;
      }

      const result = await authService.createUser({
        email,
        password,
        role: role || 'company',
        name,
        phone
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            user: {
              id: result.data!.id,
              email: result.data!.email,
              role: result.data!.role,
              name: result.data!.name,
              companyId: companyId
            }
          },
          message: 'User created successfully'
        } as ApiResponse);
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async createUser(req: Request, res: Response) {
    const { email, password, role, name, phone } = req.body;

    try {
      // Check if user already exists
      const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
      if ((existingUser as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        } as ApiResponse);
      }

      const result = await authService.createUser({
        email,
        password,
        role,
        name,
        phone
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            user: {
              id: result.data!.id,
              email: result.data!.email,
              role: result.data!.role,
              name: result.data!.name,
              phone: result.data!.phone
            }
          },
          message: 'User created successfully'
        } as ApiResponse);
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async verifyToken(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token is required'
      } as ApiResponse);
      return;
    }

    try {
      const result = await authService.verifyToken(token);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(401).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
