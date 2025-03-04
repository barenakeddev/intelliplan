import express, { Request, Response } from 'express';
import { generateRFPController, modifyRFPController } from '../controllers/rfpController';
import { parseDescriptionController, extractInfoFromMessageController } from '../controllers/nlpController';

const router = express.Router();

// Generate RFP from parsed data
router.post('/generate', async (req: Request, res: Response) => {
  try {
    await generateRFPController(req, res);
  } catch (error) {
    console.error('Error in generate RFP route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Modify RFP with AI
router.post('/modify', async (req: Request, res: Response) => {
  try {
    await modifyRFPController(req, res);
  } catch (error) {
    console.error('Error in modify RFP route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parse event description
router.post('/parse-description', async (req: Request, res: Response) => {
  try {
    await parseDescriptionController(req, res);
  } catch (error) {
    console.error('Error in parse description route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extract information from a conversation message
router.post('/extract-info', async (req: Request, res: Response) => {
  try {
    await extractInfoFromMessageController(req, res);
  } catch (error) {
    console.error('Error in extract info route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 