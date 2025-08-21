
'use server';

/**
 * @fileOverview An AI agent that provides fishing casting advice.
 * 
 * - getCastingAdvice - A function that provides recommendations for fishing.
 * - CastingAdviceInput - The input type for the getCastingAdvice function.
 * - CastingAdviceOutput - The return type for the getCastingAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Species, Location, DayContext, ThreeHourIntervalScore, ScoreStatus, LureFamily } from '@/lib/types';

const CastingAdviceInputSchema = z.object({
  species: z.custom<Species>(),
  location: z.custom<Location>(),
  lureFamily: z.custom<LureFamily>(),
  dayContext: z.custom<DayContext>(),
  scoredHours: z.array(z.custom<ThreeHourIntervalScore>()),
});
export type CastingAdviceInput = z.infer<typeof CastingAdviceInputSchema>;


const CastingAdviceOutputSchema = z.object({
    where_to_cast: z.object({
        summary: z.string().describe("A 2-3 sentence summary of where to cast, considering the species and conditions."),
        ranked_spots: z.array(z.object({
            name: z.string().describe("Name of the structure or spot type (e.g., 'Drop-offs', 'Weed Beds')."),
            score: z.number().min(0).max(100).describe("A 0-100 score for how good this spot is right now."),
            reasoning: z.string().describe("Brief (1 sentence) reasoning for why this spot is good now."),
            status: z.custom<ScoreStatus>().describe("The current fishing status for this spot type."),
        })).describe("A ranked list of up to 6 specific structure types to target."),
    }),
    how_to_fish: z.object({
        recommendation: z.string().describe("A 2-3 sentence recommendation for lure presentation and retrieval style."),
    }),
    when_to_fish: z.object({
        timing_recommendation: z.string().describe("A concise summary of the best time to fish (e.g., 'Focus on the evening bite')."),
        reasoning: z.string().describe("A brief explanation for the timing recommendation, referencing the forecast."),
    }),
});
export type CastingAdviceOutput = z.infer<typeof CastingAdviceOutputSchema>;

export async function getCastingAdvice(input: CastingAdviceInput): Promise<CastingAdviceOutput> {
  return getCastingAdviceFlow(input);
}


const prompt = ai.definePrompt({
    name: 'castingAdvicePrompt',
    input: { schema: CastingAdviceInputSchema },
    output: { schema: CastingAdviceOutputSchema },
    prompt: `
        You are a world-class fishing guide AI. Your task is to provide concise, actionable advice for an angler based on the provided data.

        **Angler's Context:**
        - **Target Species:** {{{species}}}
        - **Location:** {{{location.name}}}
        - **Selected Lure Type:** {{{lureFamily}}}

        **Environmental Context:**
        - **Sunrise:** {{{dayContext.sunrise}}}
        - **Sunset:** {{{dayContext.sunset}}}
        - **Moon Phase:** {{{dayContext.moonPhase}}} (0=new, 0.5=full)
        - **Max UV Index:** {{{dayContext.uvMax}}}

        **Short-Term Forecast (3-Hour Intervals):**
        {{#each scoredHours}}
        - **{{label}}**: Score {{score}}/100 ({{status}}), Conditions: {{condition}}
        {{/each}}

        **Your Task:**
        Generate advice based *only* on the data provided. Be concise and direct.

        1.  **Where to Cast:** Analyze the conditions and species. Suggest up to 6 specific types of structures or areas to target. For each, provide a brief reasoning, a numeric score (0-100), and a status (e.g., Prime, Good, Fair).
        2.  **How to Fish:** Based on the selected lure family ({{{lureFamily}}}), provide a specific recommendation for presentation or retrieval.
        3.  **When to Fish:** Look at the forecast scores and identify the most promising time block. Summarize this with a brief reason.
    `,
});

const getCastingAdviceFlow = ai.defineFlow(
    {
        name: 'getCastingAdviceFlow',
        inputSchema: CastingAdviceInputSchema,
        outputSchema: CastingAdviceOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
