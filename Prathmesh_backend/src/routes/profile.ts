import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ProfileController } from '../controllers/ProfileController';

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authenticateToken);

// GET /api/profile - Get user profile
router.get('/', ProfileController.getProfile);

// PUT /api/profile - Update user profile
router.put('/', ProfileController.updateProfile);

// PUT /api/profile/password - Change password
router.put('/password', ProfileController.changePassword);

// DELETE /api/profile - Delete profile (admin protected)
router.delete('/', requireRole(['admin']), ProfileController.deleteProfile);

export default router;
