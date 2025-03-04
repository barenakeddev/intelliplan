import express, { Request, Response } from 'express';
import { generateFloorPlanController } from '../controllers/floorPlanController';

const router = express.Router();

// Generate floor plan from parsed data
router.post('/generate', async (req: Request, res: Response) => {
  try {
    await generateFloorPlanController(req, res);
  } catch (error) {
    console.error('Error in generate floor plan route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 