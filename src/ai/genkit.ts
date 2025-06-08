
// Ensure .env variables are loaded at the very beginning.
// import { config as dotenvConfig } from 'dotenv';
// dotenvConfig(); 

// Critical debug log: Check your Next.js server console for this output.
console.log('GEMINI_API_KEY in genkit.ts:', process.env.GEMINI_API_KEY ? 'Loaded' : '!!! NOT LOADED !!!');

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({apiKey: process.env.GEMINI_API_KEY}), // Explicitly pass the API key
  ],
  model: 'googleai/gemini-2.0-flash', // Default model for genkit instance
});
