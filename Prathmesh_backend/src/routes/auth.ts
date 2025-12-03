import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController, loginValidation, signupValidation } from '../controllers/AuthController';

const router = express.Router();

// Validation rules for create-user endpoint
export const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'company', 'driver_owner', 'driver', 'manager', 'vehicle_owner']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number')
];

// Generic validation result handler
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => error.msg)
    });
  }
  next();
};

// POST /api/auth/login
router.post('/login', loginValidation, AuthController.login);

// POST /api/auth/signup (admin only)
router.post('/signup', signupValidation, AuthController.signup);

// POST /api/auth/create-user (admin only)
router.post('/create-user', createUserValidation, handleValidationErrors, AuthController.createUser);

// GET /api/auth/verify
router.get('/verify', AuthController.verifyToken);

export default router;
