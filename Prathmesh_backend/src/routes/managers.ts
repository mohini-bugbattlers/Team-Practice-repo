import express from 'express';
import { ManagerController } from '../controllers/ManagerController';

const router = express.Router();

// GET /api/managers
router.get('/', ManagerController.getAllManagers);

// GET /api/managers/:id
router.get('/:id', ManagerController.getManagerById);

// POST /api/managers
router.post('/', ManagerController.createManager);

// PUT /api/managers/:id
router.put('/:id', ManagerController.updateManager);

// DELETE /api/managers/:id
router.delete('/:id', ManagerController.deleteManager);

export default router;
