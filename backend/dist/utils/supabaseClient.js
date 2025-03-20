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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or key. Check your .env file.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Function to check database connection
const checkConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield exports.supabase.from('tests').select('status').eq('id', 1);
        if (error) {
            console.error("Error connecting to the database:", error.message);
            return false;
        }
        console.log("Database connection successful:");
        return true;
    }
    catch (error) {
        console.error("Error during database connection test:", error.message);
        return false;
    }
});
exports.checkConnection = checkConnection;
