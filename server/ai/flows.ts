import { ai } from './genkit';
import { z } from 'zod';

// Input/Output schemas
const TherapeuticResponseInputSchema = z.object({
  userMessage: z.string().describe("User's current message or concern"),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'counselor']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional().describe("Previous conversation context"),
});

const TherapeuticResponseOutputSchema = z.object({
  response: z.string().describe("Therapeutic response from the counselor"),
  emotionalTone: z.enum(['supportive', 'empathetic', 'encouraging', 'validating', 'exploratory']),
  riskIndicators: z.object({
    level: z.enum(['none', 'low', 'moderate', 'high', 'critical']),
    flags: z.array(z.string()).optional(),
  }),
});

export type TherapeuticResponseInput = z.infer<typeof TherapeuticResponseInputSchema>;
export type TherapeuticResponseOutput = z.infer<typeof TherapeuticResponseOutputSchema>;

// Define the therapeutic response prompt
const therapeuticResponsePrompt = ai.definePrompt({
  name: 'therapeuticResponsePrompt',
  input: { schema: TherapeuticResponseInputSchema },
  output: { schema: TherapeuticResponseOutputSchema },
  prompt: `You are a professional, empathetic AI counselor trained in evidence-based therapeutic approaches including CBT, DBT, and person-centered therapy. Your role is to provide supportive, non-judgmental guidance while maintaining professional boundaries.

Current Message: {{userMessage}}
{{#if conversationHistory}}
Conversation Context: {{conversationHistory}}
{{/if}}

THERAPEUTIC GUIDELINES:
1. **Active Listening & Empathy First**: Always acknowledge and validate the user's feelings. Use reflective listening. Normalize their experience.
2. **Collaborative Stance**: Use "we" language. Partner with the user. Give them choices on where to take the conversation.
3. **Pacing**: Don't rush to solutions. First, listen and explore. However, if the user directly asks for suggestions or "what to do," provide clear, actionable strategies.
4. **Strength-Based**: Identify and build upon the user's existing strengths. Reframe help-seeking as a strength.
5. **Safety Priority**: Assess for risk indicators while maintaining therapeutic rapport.

RESPONSE STRUCTURE:
1. **Emotional Validation**: Start with acknowledgment of their feelings and normalize the experience.
2. **Gentle Exploration**: Use gentle, open-ended questions to understand more.
3. **Offer Support**: Provide appropriate coping strategies or validation.
4. **Empowering Closing**: End with a hopeful and encouraging statement.

RISK ASSESSMENT:
- Screen for suicidal ideation, self-harm, or harm to others.
- Note expressions of hopelessness, worthlessness, or isolation.
- Identify physical symptoms of stress.

Remember: You're creating a safe, supportive space where the user feels heard, understood, and empowered. Be conversational and avoid overly clinical language.`,
});

// Define the flow
const therapeuticResponseFlow = ai.defineFlow(
  {
    name: 'therapeuticResponseFlow',
    inputSchema: TherapeuticResponseInputSchema,
    outputSchema: TherapeuticResponseOutputSchema,
  },
  async (input) => {
    const { output } = await therapeuticResponsePrompt(input);
    return output!;
  }
);

export async function generateTherapeuticResponse(input: TherapeuticResponseInput): Promise<TherapeuticResponseOutput> {
  return therapeuticResponseFlow(input);
}