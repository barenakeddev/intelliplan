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
exports.getTestStatus = void 0;
const supabaseClient_1 = require("../utils/supabaseClient");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Retrieves the status from the test table
 */
const getTestStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabaseClient_1.supabase.from('tests').select('status').eq('id', 1).single();
        if (error) {
            throw errorHandler_1.ErrorTypes.Database(`Failed to get test status: ${error.message}`, true);
        }
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw errorHandler_1.ErrorTypes.Database(`Error in getTestStatus: ${error.message}`, false);
        }
        throw error;
    }
});
exports.getTestStatus = getTestStatus;
