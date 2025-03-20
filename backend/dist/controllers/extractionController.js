"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.extractDataFromConversation = void 0;
const extractionService_1 = require("../services/extractionService");
const errorHandler_1 = require("../utils/errorHandler");
const openaiService_1 = require("../services/openaiService");
// Extract RFP data from a conversation
exports.extractDataFromConversation = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.body;
    if (!conversationId) {
        throw errorHandler_1.ErrorTypes.BadRequest("Conversation ID is required.");
    }
    const conversation = (0, openaiService_1.getConversation)(conversationId);
    if (!conversation) {
        throw errorHandler_1.ErrorTypes.NotFound(`Conversation with ID ${conversationId} not found`);
    }
    const result = yield (0, extractionService_1.extractRfpData)(conversationId, conversation.messages);
    res.status(200).json(Object.assign({ success: true, conversationId }, result));
}));
// Get recommendations for data collection
exports.getRecommendations = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    if (!conversationId) {
        throw errorHandler_1.ErrorTypes.BadRequest("Conversation ID is required.");
    }
    const recommendations = yield (0, extractionService_1.getDataCollectionRecommendations)(conversationId);
    res.status(200).json({
        success: true,
        conversationId,
        recommendations
    });
}));
