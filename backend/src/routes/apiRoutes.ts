import express, { Request, Response, NextFunction } from 'express';
import { parseDescription } from '../controllers/nlpController';
import { generateRFPController, modifyRFPController } from '../controllers/rfpController';
import { generateFloorPlanController } from '../controllers/floorPlanController';
import rfpRoutes from './rfpRoutes';
import floorPlanRoutes from './floorPlanRoutes';

const router = express.Router();

// Mount RFP routes
router.use('/rfp', rfpRoutes);

// Mount Floor Plan routes
router.use('/floorplan', floorPlanRoutes);

// Legacy routes - kept for backward compatibility
router.post('/parseDescription', (req: Request, res: Response, next: NextFunction) => {
  parseDescription(req, res).catch(next);
});

router.post('/generateRFP', (req: Request, res: Response, next: NextFunction) => {
  generateRFPController(req, res).catch(next);
});

router.post('/modifyRFP', (req: Request, res: Response, next: NextFunction) => {
  modifyRFPController(req, res).catch(next);
});

// Floor Plan routes
router.post('/generateFloorPlan', (req: Request, res: Response, next: NextFunction) => {
  generateFloorPlanController(req, res).catch(next);
});

export default router; 