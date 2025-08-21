
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
            name: z.string().describe("Name of the structure or spot type (e.g., 'Submerged Vegetation', 'Rocky Outcrops')."),
            score: z.number().min(0).max(100).describe("A 0-100 score for how good this spot is right now."),
            reasoning: z.string().describe("The 'Why': A concise (1-2 sentence) explanation for why this spot is good or bad right now."),
            status: z.custom<ScoreStatus>().describe("The current fishing status for this spot type."),
            deciding_factors: z.array(z.string()).describe("A list of 2-3 key factors (e.g., 'Wind direction', 'Cloud cover') influencing the score."),
            watch_outs: z.array(z.string()).describe("A list of 1-2 potential challenges or things to be aware of for this spot (e.g., 'Risk of snags', 'May be crowded')."),
        })).min(6).max(6).describe("A ranked list of exactly 6 specific structure types to target."),
    }),
    how_to_fish: z.object({
        summary: z.string().describe("A 1-2 sentence summary of the overall presentation strategy."),
        techniques: z.array(z.object({
            name: z.string().describe("Name of the technique (e.g., 'Slow Roll', 'Bottom Bouncing')."),
            description: z.string().describe("A brief (1 sentence) description of how to perform this technique."),
        })).min(3).max(3).describe("A list of exactly 3 specific techniques to try."),
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

        {{#if (eq species "Bream")}}
        **Zambezi & Okavango Bream Fishing Pocket Guide:**
        This is critical local knowledge. You MUST use this to inform your recommendations for Bream.

        **Targeting Predatory Bream & Pike**
        *   **1. 3" Orange Paddletail + 3/4 oz Jighead:** For pitching into reeds and drop-offs.
        *   **2. Mepps No. 4 Black Fury (Bronze/Black/Red):** Ideal for eddies and clay banks.
        *   **3. Football Jig + Craw Trailer (Black/Red):** Effective in laydowns and timber.
        *   **4. Salmo Rattlin Hornet 5 cm (Green Tiger):** Perfect for trolling drop-offs and channels.
        *   **5. Salmo Executor 7 cm (For Pike):** Use in white water and shadowy backwaters.

        **Core Techniques**
        *   **Burn-Pause-Burn:** Fast retrieve followed by a pause to trigger strikes.
        *   **Lift-Drop:** Let lure hit bottom, lift sharply, then drop to mimic prey.
        *   **Bottom Bouncing Cranks:** Tick the bottom with cranks for reaction strikes.
        *   **Anchor upstream of structure** for natural lure presentation.
        *   Early morning and late afternoon are peak bite times.

        **Target Species Behavior**
        *   **Three-Spot Tilapia:** Hunts in eddies, clay hollows, aggressive ambush predator.
        *   **Nembwe:** Largemouth predator, targets timber, reeds, and drop-offs.
        *   **Thinface:** Prefers overhanging trees, grassy areas, shadowed waters.
        *   **Humpback:** Stays near laydowns, thrives in fast-slow current transitions.
        *   **Pike:** Found in rapids and calm backwaters; jumps frequently during fight.

        **Tackle Setup & Retrieval Tips**
        *   Use 20-30 lb braid with 20 lb fluoro leader; lighter setups for finesse.
        *   Inline spinners perform best fished low and slow near the bottom.
        *   For pressured fish, downsize lures and use the thinnest braid possible.
        *   Keep rod tip down when fighting Pike to prevent lure throw.
        *   Use rattling crankbaits and attractant gels for better results in murky water.
        
        **Pro Tips:**
        1.  Keep rod tip down to prevent pike and largemouth bream from throwing the lure.
        2.  Use fluorocarbon leaders when tigers aren't present for stealth.
        3.  Adjust lure colors to water clarity - bright for muddy, natural for clear.
        4.  Early morning and late afternoon are peak feeding times.
        5.  Fish slow and low - most strikes happen near the bottom.
        {{/if}}

        **Your Task:**
        Generate advice based *only* on the data provided. Be concise and direct. If the species is Bream, heavily reference the expert knowledge provided.

        1.  **Where to Cast:** Analyze the conditions and species. Suggest exactly 6 specific types of structures or areas to target. For each spot, provide:
            - A brief, insightful 'reasoning' (the "why"). For Bream, connect this to the sub-species insights.
            - The 2-3 most 'deciding_factors' (e.g., "Wind pushing baitfish", "Low light for ambush").
            - 1-2 'watch_outs' (e.g., "Requires precise casting", "Potential for snags").
            - A numeric score (0-100), and a status (e.g., Prime, Good, Fair).
        2.  **How to Fish:** Based on the selected lure family ({{{lureFamily}}}), provide a brief summary and then recommend exactly 3 distinct techniques. For Bream, these techniques should be inspired by the "Core Techniques" and "Tackle Setup & Retrieval Tips" from the expert knowledge.
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
