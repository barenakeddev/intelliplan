"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rfpController_1 = require("../controllers/rfpController");
const extractionController_1 = require("../controllers/extractionController");
const router = express_1.default.Router();
// POST request to /api/rfp - Legacy endpoint for one-off RFP generation
router.post('/', rfpController_1.createRFP);
// Conversation endpoints
router.post('/conversation', rfpController_1.startConversation);
router.post('/message', rfpController_1.sendMessage);
router.post('/generate', rfpController_1.generateFinalDocument);
// Extraction endpoints
router.post('/extract', extractionController_1.extractDataFromConversation);
router.get('/recommendations/:conversationId', extractionController_1.getRecommendations);
exports.default = router;
