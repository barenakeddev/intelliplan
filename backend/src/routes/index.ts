import { Router } from 'express';
import { getStatus } from '../controllers/testController';
import rfpRoutes from './rfpRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test endpoints
router.get('/test/status', getStatus);

// RFP routes
router.use('/rfp', rfpRoutes);

export default router; 