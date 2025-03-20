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
exports.generateFinalDocument = exports.sendMessage = exports.startConversation = exports.createRFP = void 0;
const openaiService_1 = require("../services/openaiService");
const errorHandler_1 = require("../utils/errorHandler");
// Create a new RFP from prompt
exports.createRFP = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body; // Extract the prompt from the request body.
    if (!prompt) {
        throw errorHandler_1.ErrorTypes.BadRequest("Prompt is required for RFP generation.");
    }
    const rfpText = yield (0, openaiService_1.generateRFP)("one-time", prompt); // Use a temporary conversation ID
    res.status(200).json({ success: true, rfp: rfpText });
}));
// Create a new conversation
exports.startConversation = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = (0, openaiService_1.createConversation)();
    // Get the initial message from the AI
    const initialMessage = yield (0, openaiService_1.getInitialMessage)(conversationId);
    res.status(200).json({
        success: true,
        conversationId,
        message: initialMessage
    });
}));
// Send a message to the conversation
exports.sendMessage = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, message } = req.body;
    if (!conversationId) {
        throw errorHandler_1.ErrorTypes.BadRequest("Conversation ID is required.");
    }
    if (!message) {
        throw errorHandler_1.ErrorTypes.BadRequest("Message is required.");
    }
    const responseMessage = yield (0, openaiService_1.generateRFP)(conversationId, message);
    res.status(200).json({
        success: true,
        conversationId,
        message: responseMessage
    });
}));
// Generate the final RFP document from the conversation
exports.generateFinalDocument = (0, errorHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.body;
    if (!conversationId) {
        throw errorHandler_1.ErrorTypes.BadRequest("Conversation ID is required.");
    }
    const rfpDocument = yield (0, openaiService_1.generateFinalRFP)(conversationId);
    res.status(200).json({
        success: true,
        conversationId,
        rfp: rfpDocument
    });
}));
