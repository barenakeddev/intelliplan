import express, { Request, Response, NextFunction } from 'express';
import { parseDescription } from '../controllers/nlpController';
import { generateRFPController } from '../controllers/rfpController';
import { generateFloorPlanController } from '../controllers/floorPlanController';

const router = express.Router();

// NLP routes
router.post('/parseDescription', (req: Request, res: Response, next: NextFunction) => {
  parseDescription(req, res).catch(next);
});

// RFP routes
router.post('/generateRFP', (req: Request, res: Response, next: NextFunction) => {
  generateRFPController(req, res).catch(next);
});

// Floor Plan routes
router.post('/generateFloorPlan', (req: Request, res: Response, next: NextFunction) => {
  generateFloorPlanController(req, res).catch(next);
});

export default router; 