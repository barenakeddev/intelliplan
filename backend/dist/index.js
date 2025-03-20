"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabaseClient_1 = require("./utils/supabaseClient");
const errorHandler_1 = require("./utils/errorHandler");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api', routes_1.default);
// Check connection at startup
(0, supabaseClient_1.checkConnection)()
    .then(connected => {
    if (connected) {
        errorHandler_1.logger.info('Supabase connection successful');
    }
    else {
        errorHandler_1.logger.error('Failed to connect to Supabase');
    }
})
    .catch(error => {
    errorHandler_1.logger.error('Error checking Supabase connection', error);
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    errorHandler_1.logger.info(`Server is running on port ${port}`);
});
