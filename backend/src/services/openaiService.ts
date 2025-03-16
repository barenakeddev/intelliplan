import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ErrorTypes, logger } from '../utils/errorHandler';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRFP(prompt: string): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo', // Or another suitable model, gpt-4 if needed.
      temperature: 0.7,       // Tune for creativity vs. consistency
      max_tokens: 2048,       // Adjust as needed
    });

    if (!chatCompletion.choices[0]?.message?.content) {
      logger.warn("OpenAI returned an empty response.");
      throw ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
    }
    return chatCompletion.choices[0].message.content;
  } catch (error: any) {
    logger.error("Error in OpenAI service:", error);
    if (error.code === 'invalid_api_key') {
      throw ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
    } else {
      throw ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
    }
  }
} 