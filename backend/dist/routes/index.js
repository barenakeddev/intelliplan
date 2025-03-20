"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const rfpRoutes_1 = __importDefault(require("./rfpRoutes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Test endpoints
router.get('/test/status', testController_1.getStatus);
// RFP routes
router.use('/rfp', rfpRoutes_1.default);
exports.default = router;
