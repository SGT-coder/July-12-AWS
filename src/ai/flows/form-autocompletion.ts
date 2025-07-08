'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically filling form fields based on previous entries.
 *
 * It exports:
 * - `formAutocompletion`: The main function to trigger the form autocompletion flow.
 * - `FormAutocompletionInput`: The input type for the `formAutocompletion` function.
 * - `FormAutocompletionOutput`: The output type for the `formAutocompletion` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormAutocompletionInputSchema = z.object({
  currentFormValues: z.record(z.string(), z.any()).describe('The current values of the form fields.'),
  previousFormEntries: z
    .array(z.record(z.string(), z.any()))
    .describe('An array of previous form entries to learn from.'),
  fieldsToAutocomplete: z
    .array(z.string())
    .describe('A list of field names that should be automatically completed.'),
});
export type FormAutocompletionInput = z.infer<typeof FormAutocompletionInputSchema>;

const FormAutocompletionOutputSchema = z.record(z.string(), z.any()).describe(
  'A record containing the autocompleted form fields.'
);
export type FormAutocompletionOutput = z.infer<typeof FormAutocompletionOutputSchema>;

export async function formAutocompletion(input: FormAutocompletionInput): Promise<FormAutocompletionOutput> {
  return formAutocompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formAutocompletionPrompt',
  input: {schema: FormAutocompletionInputSchema},
  output: {schema: FormAutocompletionOutputSchema},
  prompt: `You are an AI assistant designed to help users automatically fill out forms based on previous entries.

You will be given the current values of the form, a list of previous form entries, and a list of fields that should be automatically completed.

Based on the previous form entries, predict the values for the fields to autocomplete, and return a JSON object containing only those fields with their predicted values.

Here's the current form values: {{{currentFormValues}}}

Here's a list of previous form entries: {{{previousFormEntries}}}

Here's a list of fields to autocomplete: {{{fieldsToAutocomplete}}}

Return a JSON object containing the predicted values for the fields to autocomplete. If you cannot confidently predict a value, leave the field out of the JSON object.
`,
});

const formAutocompletionFlow = ai.defineFlow(
  {
    name: 'formAutocompletionFlow',
    inputSchema: FormAutocompletionInputSchema,
    outputSchema: FormAutocompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
