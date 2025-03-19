import express from 'express';
import { 
  createRFP,
  startConversation,
  sendMessage,
  generateFinalDocument
} from '../controllers/rfpController';

const router = express.Router();

// POST request to /api/rfp - Legacy endpoint for one-off RFP generation
router.post('/', createRFP);

// Conversation endpoints
router.post('/conversation', startConversation);
router.post('/message', sendMessage);
router.post('/generate', generateFinalDocument);

export default router; 