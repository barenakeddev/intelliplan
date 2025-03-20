import { Response, NextFunction } from 'express';
import { ConversationRequest } from '../types';
import { extractRfpData, getDataCollectionRecommendations } from '../services/extractionService';
import { asyncHandler, ErrorTypes } from '../utils/errorHandler';
import { getConversation } from '../services/openaiService';

// Extract RFP data from a conversation
export const extractDataFromConversation = asyncHandler(async (req: ConversationRequest, res: Response, next: NextFunction) => {
  const { conversationId } = req.body;
  
  if (!conversationId) {
    throw ErrorTypes.BadRequest("Conversation ID is required.");
  }
  
  const conversation = getConversation(conversationId);
  
  if (!conversation) {
    throw ErrorTypes.NotFound(`Conversation with ID ${conversationId} not found`);
  }
  
  const result = await extractRfpData(conversationId, conversation.messages);
  
  res.status(200).json({
    success: true,
    conversationId,
    ...result
  });
});

// Get recommendations for data collection
export const getRecommendations = asyncHandler(async (req: ConversationRequest, res: Response, next: NextFunction) => {
  const { conversationId } = req.params;
  
  if (!conversationId) {
    throw ErrorTypes.BadRequest("Conversation ID is required.");
  }
  
  const recommendations = await getDataCollectionRecommendations(conversationId);
  
  res.status(200).json({
    success: true,
    conversationId,
    recommendations
  });
}); 