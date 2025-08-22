
'use server';
/**
 * @fileOverview An AI agent that suggests a practice drill based on incomplete quests.
 * 
 * - getSuggestedDrill - A function that returns a suggested drill key.
 * - SuggestDrillInput - The input type for the getSuggestedDrill function.
 * - SuggestDrillOutput - The return type for the getSuggestedDrill function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestDrillInputSchema = z.object({
  quests: z.array(z.any()).describe("The user's current list of weekly quests, including completion status."),
  availableDrills: z.array(z.any()).describe("The full catalog of all available practice drills the user can perform."),
});
export type SuggestDrillInput = z.infer<typeof SuggestDrillInputSchema>;


const SuggestDrillOutputSchema = z.object({
  drillKey: z.string().describe("The drillKey of the single most relevant drill to help the user complete their quests."),
  reasoning: z.string().describe("A very brief (1-sentence) explanation for why this drill was chosen."),
});
export type SuggestDrillOutput = z.infer<typeof SuggestDrillOutputSchema>;

export async function getSuggestedDrill(input: SuggestDrillInput): Promise<SuggestDrillOutput> {
  return suggestDrillFlow(input);
}


const prompt = ai.definePrompt({
    name: 'suggestDrillPrompt',
    input: { schema: SuggestDrillInputSchema },
    output: { schema: SuggestDrillOutputSchema },
    prompt: `
        You are an expert fishing coach AI. Your task is to analyze a user's weekly quests and suggest the single best drill to help them make progress.

        **User's Quests:**
        {{json quests}}

        **Available Drills:**
        {{json availableDrills}}

        **Your Task:**
        1.  Identify the quests that are NOT yet complete.
        2.  From the list of incomplete quests, pick the one that seems most achievable or foundational.
        3.  Review the 'availableDrills' and find the single best drill that directly helps the user complete that chosen quest. Look at the quest's 'criteria.scope.drillKey' to find a direct match if possible.
        4.  Return the 'drillKey' for your chosen drill and a brief, encouraging reason for your choice.
        
        Example: If a quest requires a score of 80 on "soft_skip_precision", you should recommend the drill with the key "bream_soft_skip_precision_v1" or "bass_soft_skip_precision_v1".
    `,
});

const suggestDrillFlow = ai.defineFlow(
    {
        name: 'suggestDrillFlow',
        inputSchema: SuggestDrillInputSchema,
        outputSchema: SuggestDrillOutputSchema,
    },
    async (input) => {
        // Filter for incomplete quests to simplify the prompt for the AI
        const incompleteQuests = input.quests.filter(q => !q.isComplete);
        
        if (incompleteQuests.length === 0) {
            // If all quests are complete, suggest a random drill as a default
            const randomIndex = Math.floor(Math.random() * input.availableDrills.length);
            const randomDrill = input.availableDrills[randomIndex];
            return {
                drillKey: randomDrill.drillKey,
                reasoning: "You've completed all your quests! Here's a fun drill to try."
            };
        }
        
        const { output } = await prompt({
            quests: incompleteQuests,
            availableDrills: input.availableDrills,
        });
        
        if (!output) {
            throw new Error("AI suggestion returned no output.");
        }

        return output;
    }
);
