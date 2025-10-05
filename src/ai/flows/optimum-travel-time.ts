'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting the optimum time
 * for a parade/event based on weather conditions and providing a risk assessment.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --------------------------------------------------------------------------------
// 1. UPDATED SCHEMA: Focus on Event Start Time and Risk Analysis
// --------------------------------------------------------------------------------

const SuggestOptimumEventTimeInputSchema = z.object({
  location: z.string().describe('The location for the outdoor event/parade.'),
  earliestTime: z.string().describe('The earliest time the event can begin (ISO format).'),
  latestTime: z.string().describe('The latest time the event can begin (ISO format).'),
  // Removed commuteDurationMinutes as it's not relevant for a parade start time.
  weatherData: z.string().describe('A summary of the current and hourly forecast data, including temperature and precipitation, for the time window.'),
});
export type SuggestOptimumEventTimeInput = z.infer<typeof SuggestOptimumEventTimeInputSchema>;

const SuggestOptimumEventTimeOutputSchema = z.object({
  suggestedStartTime: z.string().describe('The AI-suggested start time for the parade/event (ISO format).'),
  riskSummary: z.string().describe('An analysis of associated risks (e.g., heat stress, heavy rain, wind hazards) and one clear safety precaution for the location and suggested time.'),
});
export type SuggestOptimumEventTimeOutput = z.infer<typeof SuggestOptimumEventTimeOutputSchema>;


// --------------------------------------------------------------------------------
// 2. EXPORTED FUNCTION AND FLOW DEFINITION
// --------------------------------------------------------------------------------

export async function suggestOptimumEventTime(
  input: SuggestOptimumEventTimeInput
): Promise<SuggestOptimumEventTimeOutput> {
  // Use the new flow name
  return suggestOptimumEventTimeFlow(input);
}

const suggestOptimumEventTimeFlow = ai.defineFlow(
  {
    name: 'suggestOptimumEventTimeFlow',
    inputSchema: SuggestOptimumEventTimeInputSchema,
    outputSchema: SuggestOptimumEventTimeOutputSchema,
  },
  async input => {
    try {
      // Call the prompt with the input
      const {output} = await suggestOptimumEventTimePrompt(input);
      if (!output) {
        throw new Error('Gemini API call returned no output.');
      }
      return output;
    } catch (error) {
      console.error('Error in Gemini API call:', error);
      // Return a structured error response
      return {
        suggestedStartTime: '', // Or a default/placeholder value
        riskSummary: `Error processing event time suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
);


// --------------------------------------------------------------------------------
// 3. CORRECTED PROMPT DEFINITION: Using config.system
// --------------------------------------------------------------------------------

const suggestOptimumEventTimePrompt = ai.definePrompt({
  name: 'suggestOptimumEventTimePrompt',
  input: {schema: SuggestOptimumEventTimeInputSchema},
  output: {schema: SuggestOptimumEventTimeOutputSchema},
  // !! CRITICAL FIX: Removed the entire 'config' block !! 
  
  prompt: ` 
 **CRITICAL SYSTEM INSTRUCTION:** You are a Public Safety Analyst working for SPRINT - Storm Perception Risk Intelligence Network Tool. Your task is to analyze weather data for a planned outdoor event (a parade). Your response must select the most optimal start time within the window and provide a detailed risk analysis and safety precaution for that selected time. Prioritize minimizing heat stress and avoiding heavy precipitation. 
 
 --- 
 
 Given the following information, perform the following tasks: 
 1. Suggest an optimum start time (ISO format) within the provided window that minimizes weather-related risk for a large crowd. 
 2. Provide a risk summary, explaining your choice, and detailing the associated risks (e.g., heat stress, heavy rain, wind hazards) for the suggested time. 
 3. Include one clear, actionable safety precaution for event organizers. 
 
 Location: {{{location}}} 
 Earliest Event Start Time: {{{earliestTime}}} 
 Latest Event Start Time: {{{latestTime}}} 
 
 Weather Data Summary for the Window: 
 {{{weatherData}}} 
 
 The response must conform strictly to the JSON schema. 
 `, 
 });