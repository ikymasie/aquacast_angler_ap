
'use server';
/**
 * @fileOverview An AI agent that analyzes a photo of a fish.
 * 
 * - analyzePhoto - A function that analyzes a photo of a fish catch.
 * - PhotoAnalysisInput - The input type for the analyzePhoto function.
 * - PhotoAnalysisOutput - The return type for the analyzePhoto function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PhotoAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a fish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PhotoAnalysisInput = z.infer<typeof PhotoAnalysisInputSchema>;

const PhotoAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A short, one-sentence analysis of the fish in the photo, mentioning the likely species."),
});
export type PhotoAnalysisOutput = z.infer<typeof PhotoAnalysisOutputSchema>;

export async function analyzePhoto(input: PhotoAnalysisInput): Promise<PhotoAnalysisOutput> {
  return analyzePhotoFlow(input);
}


const prompt = ai.definePrompt({
    name: 'photoAnalysisPrompt',
    input: { schema: PhotoAnalysisInputSchema },
    output: { schema: PhotoAnalysisOutputSchema },
    prompt: `
        You are a fishing expert. Analyze the provided photo of a fish.
        Identify the species of the fish and provide a single, concise sentence about it.
        For example: "That looks like a healthy Largemouth Bass, a great catch!"

        Photo: {{media url=photoDataUri}}
    `,
});

const analyzePhotoFlow = ai.defineFlow(
    {
        name: 'analyzePhotoFlow',
        inputSchema: PhotoAnalysisInputSchema,
        outputSchema: PhotoAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
