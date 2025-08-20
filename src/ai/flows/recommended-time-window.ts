'use server';

/**
 * @fileOverview An AI agent that recommends the best time window for fishing based on weather conditions and species.
 *
 * - getRecommendedTimeWindow - A function that retrieves the recommended fishing time window.
 * - RecommendedTimeWindowInput - The input type for the getRecommendedTimeWindow function.
 * - RecommendedTimeWindowOutput - The return type for the getRecommendedTimeWindow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendedTimeWindowInputSchema = z.object({
  species: z.string().describe('The target fish species (e.g., Bream, Bass, Carp).'),
  latitude: z.number().describe('The latitude of the fishing location.'),
  longitude: z.number().describe('The longitude of the fishing location.'),
  currentConditions: z.string().describe('Current weather conditions at the location.'),
  hourlyForecast: z.string().describe('Hourly weather forecast for the next 24 hours.'),
});
export type RecommendedTimeWindowInput = z.infer<typeof RecommendedTimeWindowInputSchema>;

const RecommendedTimeWindowOutputSchema = z.object({
  recommendedTimeWindow: z
    .string()
    .describe(
      'A description of the recommended time window for fishing, including start and end times and reasons for the recommendation.'
    ),
  fishingSuccessScore: z.number().describe('An overall fishing success score for the recommended time window.'),
});
export type RecommendedTimeWindowOutput = z.infer<typeof RecommendedTimeWindowOutputSchema>;

export async function getRecommendedTimeWindow(
  input: RecommendedTimeWindowInput
): Promise<RecommendedTimeWindowOutput> {
  return recommendedTimeWindowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendedTimeWindowPrompt',
  input: {schema: RecommendedTimeWindowInputSchema},
  output: {schema: RecommendedTimeWindowOutputSchema},
  prompt: `You are an expert fishing guide, recommending the best time window for fishing.

  Based on the current weather conditions, hourly forecast, and target fish species, determine and highlight the best time window for fishing.
  Provide a fishing success score between 0 and 100.
  Explain the reasons for your recommendation, considering factors like temperature, wind, and species behavior.

  Species: {{species}}
  Location: Latitude {{latitude}}, Longitude {{longitude}}
  Current Conditions: {{currentConditions}}
  Hourly Forecast: {{hourlyForecast}}

  Recommended Time Window:`,
});

const recommendedTimeWindowFlow = ai.defineFlow(
  {
    name: 'recommendedTimeWindowFlow',
    inputSchema: RecommendedTimeWindowInputSchema,
    outputSchema: RecommendedTimeWindowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
