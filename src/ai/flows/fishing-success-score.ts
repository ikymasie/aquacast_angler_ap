'use server';

/**
 * @fileOverview Calculates and recommends fishing success score based on species and conditions.
 *
 * - calculateFishingSuccessScore - A function that calculates the fishing success score.
 * - FishingSuccessScoreInput - The input type for the calculateFishingSuccessScore function.
 * - FishingSuccessScoreOutput - The return type for the calculateFishingSuccessScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FishingSuccessScoreInputSchema = z.object({
  species: z.enum(['Bream', 'Bass', 'Carp']).describe('The target fish species.'),
  met: z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    windSpeed: z.number().describe('The current wind speed in km/h.'),
    humidity: z.number().describe('The current humidity as a percentage.'),
  }).describe('Meteorological conditions.'),
  hydro: z.object({
    waterTemperature: z.number().describe('The current water temperature in Celsius.'),
    waterClarity: z.string().describe('The water clarity (e.g., clear, murky).'),
  }).describe('Hydrological conditions.'),
  sunmoon: z.object({
    sunrise: z.string().describe('The sunrise time in HH:MM format.'),
    sunset: z.string().describe('The sunset time in HH:MM format.'),
    moonPhase: z.string().describe('The current moon phase (e.g., new moon, full moon).'),
  }).describe('Sun and moon conditions.'),
  clock: z.object({
    currentTime: z.string().describe('The current time in HH:MM format.'),
  }).describe('Time information'),
  location: z.string().describe('The location where the fishing will take place'),
});

export type FishingSuccessScoreInput = z.infer<typeof FishingSuccessScoreInputSchema>;

const FishingSuccessScoreOutputSchema = z.object({
  successScore: z.number().describe('A score between 0 and 100 indicating the likelihood of a successful fishing trip.'),
  recommendedTimeWindow: z.string().describe('A short string describing the recommended time window for fishing.'),
});

export type FishingSuccessScoreOutput = z.infer<typeof FishingSuccessScoreOutputSchema>;

export async function calculateFishingSuccessScore(input: FishingSuccessScoreInput): Promise<FishingSuccessScoreOutput> {
  return fishingSuccessScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fishingSuccessScorePrompt',
  input: {schema: FishingSuccessScoreInputSchema},
  output: {schema: FishingSuccessScoreOutputSchema},
  prompt: `You are an expert fishing guide, providing a fishing success score and recommending a time window based on the current conditions for {{species}} in {{location}}.\n\nConsider the following factors:\n- Species: {{species}}\n- Meteorological Conditions: Temperature: {{met.temperature}}°C, Wind Speed: {{met.windSpeed}} km/h, Humidity: {{met.humidity}}%\n- Hydrological Conditions: Water Temperature: {{hydro.waterTemperature}}°C, Water Clarity: {{hydro.waterClarity}}\n- Sun and Moon Conditions: Sunrise: {{sunmoon.sunrise}}, Sunset: {{sunmoon.sunset}}, Moon Phase: {{sunmoon.moonPhase}}\n- Current Time: {{clock.currentTime}}\n\nBased on these conditions, provide a successScore (0-100) and a recommendedTimeWindow. Explain briefly how you calculated the score.\nRemember that a low score indicates there is a low chance of catching fish, and a high score indicates there is a high chance of catching fish. You should take into account that bass, bream, and carp, have different preferred conditions. Be as accurate as possible in your determination.\n\nOutput format: {{output}}`,
});

const fishingSuccessScoreFlow = ai.defineFlow(
  {
    name: 'fishingSuccessScoreFlow',
    inputSchema: FishingSuccessScoreInputSchema,
    outputSchema: FishingSuccessScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

