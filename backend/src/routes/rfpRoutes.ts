import express from 'express';
import { 
  createRFP,
  startConversation,
  sendMessage,
  generateFinalDocument
} from '../controllers/rfpController';
import {
  extractDataFromConversation,
  getRecommendations
} from '../controllers/extractionController';

const router = express.Router();

// POST request to /api/rfp - Legacy endpoint for one-off RFP generation
router.post('/', createRFP);

// Conversation endpoints
router.post('/conversation', startConversation);
router.post('/message', sendMessage);
router.post('/generate', generateFinalDocument);

// Extraction endpoints
router.post('/extract', extractDataFromConversation);
router.get('/recommendations/:conversationId', getRecommendations);

export default router; 