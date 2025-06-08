'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting the optimum travel time
 * based on weather conditions.
 *
 * - suggestOptimumTravelTime - A function that returns AI-suggested times to begin commute.
 * - SuggestOptimumTravelTimeInput - The input type for the suggestOptimumTravelTime function.
 * - SuggestOptimumTravelTimeOutput - The return type for the suggestOptimumTravelTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimumTravelTimeInputSchema = z.object({
  location: z.string().describe('The location for the commute.'),
  startTime: z.string().describe('The earliest time the commute can begin (ISO format).'),
  endTime: z.string().describe('The latest time the commute can begin (ISO format).'),
  commuteDurationMinutes: z.number().describe('The expected duration of the commute in minutes.'),
});
export type SuggestOptimumTravelTimeInput = z.infer<typeof SuggestOptimumTravelTimeInputSchema>;

const SuggestOptimumTravelTimeOutputSchema = z.object({
  suggestedStartTime: z.string().describe('The AI-suggested start time for the commute (ISO format).'),
  reason: z.string().describe('The reason for the suggested start time.'),
});
export type SuggestOptimumTravelTimeOutput = z.infer<typeof SuggestOptimumTravelTimeOutputSchema>;

export async function suggestOptimumTravelTime(
  input: SuggestOptimumTravelTimeInput
): Promise<SuggestOptimumTravelTimeOutput> {
  return suggestOptimumTravelTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimumTravelTimePrompt',
  input: {schema: SuggestOptimumTravelTimeInputSchema},
  output: {schema: SuggestOptimumTravelTimeOutputSchema},
  prompt: `You are a helpful AI assistant that suggests the best time to start a commute, taking into account weather conditions.

  Given the following information, suggest an optimum start time within the provided window, and explain your reasoning:

  Location: {{{location}}}
  Earliest Start Time: {{{startTime}}}
  Latest Start Time: {{{endTime}}}
  Commute Duration: {{{commuteDurationMinutes}}} minutes

  Consider factors like temperature and precipitation to suggest a time that would result in a more comfortable commute.  The response must conform to the schema.
  `,
});

const suggestOptimumTravelTimeFlow = ai.defineFlow(
  {
    name: 'suggestOptimumTravelTimeFlow',
    inputSchema: SuggestOptimumTravelTimeInputSchema,
    outputSchema: SuggestOptimumTravelTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
