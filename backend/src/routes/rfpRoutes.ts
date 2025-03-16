import express from 'express';
import { createRFP } from '../controllers/rfpController';

const router = express.Router();

// POST request to /api/rfp
router.post('/', createRFP);

export default router; 