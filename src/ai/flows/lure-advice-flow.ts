
'use server';
/**
 * @fileOverview An AI agent that provides advice on lure selection based on current conditions.
 * 
 * - getLureAdvice - A function that provides recommendations for a specific lure.
 * - LureAdviceInput - The input type for the getLureAdvice function.
 * - LureAdviceOutput - The return type for the getLureAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Species, LureFamily, DayContext, HourPoint, RecentWindow } from '@/lib/types';

const LureAdviceInputSchema = z.object({
  species: z.custom<Species>(),
  lureFamily: z.custom<LureFamily>(),
  dayContext: z.custom<DayContext>(),
  currentHour: z.custom<HourPoint>(),
  recentWindow: z.custom<RecentWindow>(),
});
export type LureAdviceInput = z.infer<typeof LureAdviceInputSchema>;


const LureAdviceOutputSchema = z.object({
    conditionScore: z.number().min(0).max(10).describe("A single 0-10 score indicating how suitable the current conditions are for the selected lure family. 0 is worst, 10 is best."),
    summary: z.string().describe("A 1-2 sentence summary explaining the score, referencing the most important conditions."),
    wind: z.string().describe("A very short (1-3 word) descriptor for the wind's impact (e.g., 'Calm', 'Ripples', 'Challenging')."),
    light: z.string().describe("A very short (1-3 word) descriptor for the light conditions (e.g., 'Bright Sun', 'Overcast', 'Low Light')."),
    waterClarity: z.string().describe("A very short (1-3 word) descriptor for the estimated water clarity (e.g., 'Clear', 'Stained', 'Muddy')."),
});
export type LureAdviceOutput = z.infer<typeof LureAdviceOutputSchema>;

export async function getLureAdvice(input: LureAdviceInput): Promise<LureAdviceOutput> {
  return getLureAdviceFlow(input);
}


const prompt = ai.definePrompt({
    name: 'lureAdvicePrompt',
    input: { schema: LureAdviceInputSchema },
    output: { schema: LureAdviceOutputSchema },
    prompt: `
        You are an expert fishing guide AI. Your task is to provide a quick, actionable analysis of the current conditions for a specific lure type.

        **Angler's Context:**
        - **Target Species:** {{{species}}}
        - **Selected Lure Type:** {{{lureFamily}}}

        **Current Conditions:**
        - **Time:** {{{currentHour.t}}}
        - **Air Temp:** {{{currentHour.tempC}}}°C
        - **Wind:** {{{currentHour.windKph}}} kph
        - **Cloud Cover:** {{{currentHour.cloudPct}}}%
        - **Pressure Trend (3h):** {{{currentHour.derived.pressureTrend3h}}} hPa
        - **Recent Precip (from client):** Not available, infer from cloud cover and pressure.
        - **Sunrise:** {{{dayContext.sunrise}}}
        - **Sunset:** {{{dayContext.sunset}}}
        - **Est. Water Temp:** {{{recentWindow.waterTempC}}}°C

        **Your Task:**
        1.  **Analyze Conditions:** Evaluate how the wind, light (inferred from cloud cover and time of day), and water clarity (inferred from recent wind/rain) will affect the chosen lure family for the target species.
        2.  **Generate a Condition Score (0-10):** Based on your analysis, provide a single score from 0 to 10 indicating how favorable the current conditions are for this lure. A 10 means perfect conditions. A 0 means it's nearly impossible to use this lure effectively.
        3.  **Write a Concise Summary:** In 1-2 sentences, explain the reasoning behind your score.
        4.  **Provide Short Descriptors:** For Wind, Light, and Water Clarity, provide very brief (1-3 word) descriptors.
            -   **Wind:** e.g., "Calm", "Light Breeze", "Windy Chop"
            -   **Light:** e.g., "Bright Sun", "Partly Cloudy", "Overcast"
            -   **Water Clarity:** Infer this. High wind or recent low pressure (suggesting rain) means lower clarity. e.g., "Clear", "Stained", "Muddy".
    `,
});

const getLureAdviceFlow = ai.defineFlow(
    {
        name: 'getLureAdviceFlow',
        inputSchema: LureAdviceInputSchema,
        outputSchema: LureAdviceOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
