import { Response, NextFunction } from 'express';
import { RfpRequest, RfpResponse, ConversationRequest, MessageRequest } from '../types';
import { 
  generateRFP, 
  createConversation, 
  getInitialMessage, 
  generateFinalRFP 
} from '../services/openaiService';
import { asyncHandler, ErrorTypes } from '../utils/errorHandler';

// Create a new RFP from prompt
export const createRFP = asyncHandler(async (req: RfpRequest, res: Response<RfpResponse>, next: NextFunction) => {
  const { prompt } = req.body;  // Extract the prompt from the request body.

  if (!prompt) {
    throw ErrorTypes.BadRequest("Prompt is required for RFP generation.");
  }

  const rfpText = await generateRFP("one-time", prompt); // Use a temporary conversation ID
  res.status(200).json({ success: true, rfp: rfpText });
});

// Create a new conversation
export const startConversation = asyncHandler(async (req: ConversationRequest, res: Response, next: NextFunction) => {
  const conversationId = createConversation();
  
  // Get the initial message from the AI
  const initialMessage = await getInitialMessage(conversationId);
  
  res.status(200).json({ 
    success: true, 
    conversationId, 
    message: initialMessage
  });
});

// Send a message to the conversation
export const sendMessage = asyncHandler(async (req: MessageRequest, res: Response, next: NextFunction) => {
  const { conversationId, message } = req.body;
  
  if (!conversationId) {
    throw ErrorTypes.BadRequest("Conversation ID is required.");
  }
  
  if (!message) {
    throw ErrorTypes.BadRequest("Message is required.");
  }
  
  const responseMessage = await generateRFP(conversationId, message);
  
  res.status(200).json({
    success: true,
    conversationId,
    message: responseMessage
  });
});

// Generate the final RFP document from the conversation
export const generateFinalDocument = asyncHandler(async (req: ConversationRequest, res: Response, next: NextFunction) => {
  const { conversationId } = req.body;
  
  if (!conversationId) {
    throw ErrorTypes.BadRequest("Conversation ID is required.");
  }
  
  const rfpDocument = await generateFinalRFP(conversationId);
  
  res.status(200).json({
    success: true,
    conversationId,
    rfp: rfpDocument
  });
}); 