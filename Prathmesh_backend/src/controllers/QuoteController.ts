import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { QuoteService } from '../services/QuoteService';
import { ApiResponse, CreateQuoteRequest } from '../interfaces';

const quoteService = new QuoteService();

// Quote validation rules
export const createQuoteValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters'),
  
  body('from_location')
    .notEmpty()
    .withMessage('From location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('From location must be between 3 and 200 characters'),
  
  body('to_location')
    .notEmpty()
    .withMessage('To location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('To location must be between 3 and 200 characters'),
  
  body('product_type')
    .notEmpty()
    .withMessage('Product type is required')
    .isIn(['Edible Oil', 'Chemicals', 'Other'])
    .withMessage('Product type must be Edible Oil, Chemicals, or Other'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be a positive number'),
  
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['Liters', 'Tons', 'Containers'])
    .withMessage('Unit must be Liters, Tons, or Containers'),
  
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message must not exceed 1000 characters'),
  
  body('preferred_contact_method')
    .optional()
    .isIn(['email', 'phone', 'whatsapp'])
    .withMessage('Preferred contact method must be email, phone, or whatsapp')
];

// Generic validation result handler
const handleValidationErrors = (req: Request, res: Response): boolean => {
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

export class QuoteController {
  static async createQuote(req: Request, res: Response) {
    if (!handleValidationErrors(req, res)) return;

    try {
      const quoteData: CreateQuoteRequest = req.body;
      const result = await quoteService.createQuote(quoteData);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error in createQuote controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getAllQuotes(req: Request, res: Response) {
    try {
      const result = await quoteService.getAllQuotes();

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error in getAllQuotes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateQuoteStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Quote ID and status are required'
      } as ApiResponse);
    }

    try {
      const result = await quoteService.updateQuoteStatus(parseInt(id), status);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: result.message
        } as ApiResponse);
      } else {
        if (result.error === 'Quote not found') {
          res.status(404).json({
            success: false,
            message: result.error
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: result.error
          } as ApiResponse);
        }
      }
    } catch (error) {
      console.error('Error in updateQuoteStatus controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
