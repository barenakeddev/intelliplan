"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nlpController_1 = require("../controllers/nlpController");
const rfpController_1 = require("../controllers/rfpController");
const floorPlanController_1 = require("../controllers/floorPlanController");
const router = express_1.default.Router();
// NLP routes
router.post('/parseDescription', (req, res, next) => {
    (0, nlpController_1.parseDescription)(req, res).catch(next);
});
// RFP routes
router.post('/generateRFP', (req, res, next) => {
    (0, rfpController_1.generateRFPController)(req, res).catch(next);
});

router.post('/modifyRFP', (req, res, next) => {
    (0, rfpController_1.modifyRFPController)(req, res).catch(next);
});

// Floor Plan routes
router.post('/generateFloorPlan', (req, res, next) => {
    (0, floorPlanController_1.generateFloorPlanController)(req, res).catch(next);
});
exports.default = router;
