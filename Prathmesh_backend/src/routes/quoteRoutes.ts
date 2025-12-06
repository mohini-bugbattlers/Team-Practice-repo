import { Router } from 'express';
import { QuoteController, createQuoteValidation } from '../controllers/QuoteController';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../interfaces';

const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error: any) => error.msg)
    } as ApiResponse);
  }
  next();
};

const router = Router();

// POST /api/quotes - Create a new quote request
router.post('/', createQuoteValidation, validateRequest, QuoteController.createQuote);

// GET /api/quotes - Get all quote requests (admin only)
router.get('/', QuoteController.getAllQuotes);

// PUT /api/quotes/:id/status - Update quote status (admin only)
router.put('/:id/status', QuoteController.updateQuoteStatus);

export default router;
