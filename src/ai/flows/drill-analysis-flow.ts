
'use server';

/**
 * @fileOverview An AI agent that analyzes a completed practice drill session.
 * 
 * - getDrillAnalysis - A function that provides analysis and insights on a practice session.
 * - DrillAnalysisInput - The input type for the getDrillAnalysis function.
 * - DrillAnalysisOutput - The return type for the getDrillAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define Zod schemas for the complex types
const KpiSchema = z.object({
    accuracyPct: z.number().optional(),
    avgDistanceErrorCm: z.number().optional(),
    quietEntryPct: z.number().optional(),
    inBandPct: z.number().optional(),
    misses: z.number().optional(),
    centerHits: z.number().optional(),
});

const SessionSchema = z.object({
    drillKey: z.string(),
    drillName: z.string(),
    speciesKey: z.string(),
    rounds: z.array(z.any()), // Can be more specific if round structure is known
});

const DrillAnalysisInputSchema = z.object({
  session: SessionSchema,
  kpis: KpiSchema,
  normalizedScore: z.number(),
  band: z.string(),
});
export type DrillAnalysisInput = z.infer<typeof DrillAnalysisInputSchema>;


const DrillAnalysisOutputSchema = z.object({
  insightsVersion: z.string().default("1.0"),
  confidence: z.enum(["low", "medium", "high"]),
  outcome: z.array(z.string()).max(3).describe("A list of 1-3 key positive outcomes from the session. Each is a single, concise sentence that includes the 'why'."),
  improve: z.array(z.string()).max(3).describe("A list of 1-3 specific areas for improvement. Each is a single, concise sentence and includes justification from the data."),
  nextSteps: z.array(z.string()).max(3).describe("A list of 1-3 actionable next steps or drills. Each is a single, concise sentence."),
  evidence: z.object({
    kpis: KpiSchema,
    notableEvents: z.array(z.string()).optional(),
  }),
});
export type DrillAnalysisOutput = z.infer<typeof DrillAnalysisOutputSchema>;


export async function getDrillAnalysis(input: DrillAnalysisInput): Promise<DrillAnalysisOutput> {
  // AI-based analysis is the primary path
  try {
    return await getDrillAnalysisFlow(input);
  } catch (error) {
    console.warn("AI drill analysis failed, using deterministic fallback.", error);
    // Deterministic fallback if AI fails
    return generateFallbackAnalysis(input);
  }
}

const generateFallbackAnalysis = (input: DrillAnalysisInput): DrillAnalysisOutput => {
    const { kpis } = input;
    const outcome = [`You achieved an accuracy of ${kpis.accuracyPct}%, with ${kpis.centerHits} bullseyes.`];
    const improve = ["Focus on reducing misses on longer casts to improve your overall score."];
    const nextSteps = ["Repeat this drill tomorrow to build muscle memory and improve your streak."];

    return {
        insightsVersion: "1.0-fallback",
        confidence: "medium",
        outcome,
        improve,
        nextSteps,
        evidence: {
            kpis,
            notableEvents: ["fallback_generated"],
        },
    };
};


const prompt = ai.definePrompt({
    name: 'drillAnalysisPrompt',
    input: { schema: DrillAnalysisInputSchema },
    output: { schema: DrillAnalysisOutputSchema },
    prompt: `
        You are a world-class fishing coach AI. Your task is to analyze a completed practice drill session and provide concise, actionable insights.

        **Session Data:**
        - Drill Name: {{{session.drillName}}}
        - Species: {{{session.speciesKey}}}
        - Final Score: {{{normalizedScore}}}/100
        - Performance Band: {{{band}}}

        **Key Performance Indicators (KPIs):**
        - Accuracy: {{{kpis.accuracyPct}}}%
        - Bullseye Hits: {{{kpis.centerHits}}}
        - Misses: {{{kpis.misses}}}
        - Other KPIs: {{json kpis}}
        
        **Full Session Timeline (for context):**
        {{json session.rounds}}

        **Your Task:**
        Generate a structured analysis based *only* on the data provided. Be concise, direct, and encouraging. Each point should be a single sentence.

        1.  **Outcome (1-3 points):** Identify the most successful parts of the session. What went well and why?
            - Example: "You were most accurate on casts 6–8 after slowing the entry, which raised quiet-entry to 78%."

        2.  **Improve (1-3 points):** Find the biggest opportunities for improvement based on the KPIs. What should the user focus on next time?
            - Example: "Lower your release angle on long casts; high trajectories added 28 cm of average error in the crosswind."

        3.  **Next Steps (1-3 points):** Suggest concrete actions for the user. This could be repeating the drill with a modification or trying a different drill.
            - Example: "Repeat this drill with the lane width reduced to 3m to tighten your depth control."
        
        Ensure the output is in the required JSON format.
    `,
});

const getDrillAnalysisFlow = ai.defineFlow(
    {
        name: 'getDrillAnalysisFlow',
        inputSchema: DrillAnalysisInputSchema,
        outputSchema: DrillAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        
        if (!output) {
            throw new Error("AI analysis returned no output.");
        }
        
        // Ensure the evidence field is populated correctly
        output.evidence.kpis = input.kpis;

        return output;
    }
);
