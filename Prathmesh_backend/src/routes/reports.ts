import express, { Request, Response } from 'express';
import { TripController } from '../controllers/TripController';

const router = express.Router();

// GET /api/reports/trips
router.get('/trips', TripController.getTripStats);

// GET /api/reports/revenue
router.get('/revenue', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      type: 'revenue',
      period: 'monthly',
      data: {
        monthlyBreakdown: [
          { month: 'Jan', revenue: 240000 },
          { month: 'Feb', revenue: 280000 },
          { month: 'Mar', revenue: 320000 },
          { month: 'Apr', revenue: 290000 },
          { month: 'May', revenue: 350000 },
          { month: 'Jun', revenue: 310000 }
        ]
      }
    }
  });
});

// GET /api/reports/users
router.get('/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      type: 'users',
      period: 'current',
      data: {
        userTypeBreakdown: [
          { type: 'companies', count: 45 },
          { type: 'vehicle_owners', count: 67 },
          { type: 'drivers', count: 156 },
          { type: 'managers', count: 8 }
        ]
      }
    }
  });
});

export default router;
