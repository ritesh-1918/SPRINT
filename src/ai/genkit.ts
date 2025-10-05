// Example configuration snippet (usually in dev.ts or similar)
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
    // ... other plugins 
  ],
  // ... other configurations
});