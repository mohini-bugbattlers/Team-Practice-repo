import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/documents
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Documents API - Coming Soon' });
});

// GET /api/documents/trip/:tripId
router.get('/trip/:tripId', (req: Request, res: Response) => {
  res.json({ message: 'Trip documents API - Coming Soon' });
});

// POST /api/documents/upload
router.post('/upload', (req: Request, res: Response) => {
  res.json({ message: 'Document upload API - Coming Soon' });
});

export default router;
