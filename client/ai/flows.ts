'use server';
/**
 * @fileOverview Enhanced AI Counselor System for CampusCare
 * Incorporates evidence-based therapeutic approaches and professional counseling practices
 */

import {ai} from './genkit';
import {z} from 'genkit';

// ============================================================================
// 1. THERAPEUTIC CONVERSATION FLOW
// ============================================================================

const TherapeuticResponseInputSchema = z.object({
  userMessage: z.string().describe("User's current message or concern"),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'counselor']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional().describe("Previous conversation context"),
  userProfile: z.object({
    preferredLanguage: z.enum(['english', 'hindi', 'kashmiri']).optional(),
    previousConcerns: z.array(z.string()).optional(),
    currentMoodState: z.string().optional(),
  }).optional(),
});

const TherapeuticResponseOutputSchema = z.object({
  response: z.string().describe("Therapeutic response from the counselor"),
  emotionalTone: z.enum(['supportive', 'empathetic', 'encouraging', 'validating', 'exploratory']),
  suggestedTechniques: z.array(z.string()).optional(),
  followUpQuestions: z.array(z.string()).optional(),
  riskIndicators: z.object({
    level: z.enum(['none', 'low', 'moderate', 'high', 'critical']),
    flags: z.array(z.string()).optional(),
  }),
});

export type TherapeuticResponseInput = z.infer<typeof TherapeuticResponseInputSchema>;
export type TherapeuticResponseOutput = z.infer<typeof TherapeuticResponseOutputSchema>;

const therapeuticResponsePrompt = ai.definePrompt({
  name: 'therapeuticResponsePrompt',
  input: {schema: TherapeuticResponseInputSchema},
  output: {schema: TherapeuticResponseOutputSchema},
}, (input) => {
  let prompt = `You are a professional, empathetic AI counselor trained in evidence-based therapeutic approaches including CBT, DBT, and person-centered therapy. Your role is to provide supportive, non-judgmental guidance while maintaining professional boundaries.

Current Message: ${input.userMessage}`;

  if (input.conversationHistory && input.conversationHistory.length > 0) {
    prompt += `\n\nConversation Context: ${JSON.stringify(input.conversationHistory)}`;
  }

  if (input.userProfile) {
    prompt += `\n\nUser Profile: ${JSON.stringify(input.userProfile)}`;
  }

  prompt += `

THERAPEUTIC GUIDELINES:
1. **Active Listening & Empathy First**: Always acknowledge and validate the user's feelings. Use reflective listening. Normalize their experience.
2. **Collaborative Stance**: Use "we" language. Partner with the user. Give them choices on where to take the conversation.
3. **Pacing**: Don't rush to solutions. First, listen and explore. **However, if the user directly asks for suggestions or "what to do," your primary goal is to provide a few clear, actionable strategies.** After offering strategies, you can return to a more exploratory conversation.
4. **Strength-Based**: Identify and build upon the user's existing strengths. Reframe help-seeking as a strength.
5. **Safety Priority**: Assess for risk indicators while maintaining therapeutic rapport.

RESPONSE STRUCTURE:
1. **Emotional Validation**: Start with a strong acknowledgment of their feelings and normalize the experience.
2. **Introduce a Bridge**: Offer a small, immediate coping tool (like a breathing exercise) if they seem highly distressed, before diving deeper.
3. **Gentle Exploration**: Use gentle, open-ended questions to understand more. Challenge black-and-white thinking softly (e.g., "I wonder if there's another way to look at this?").
4. **Offer a Choice**: Ask what would be most helpful next (e.g., practical strategies vs. exploring feelings).
5. **Empowering Closing**: End with a hopeful and encouraging statement that gives the user agency.

RISK ASSESSMENT:
- Screen for suicidal ideation, self-harm, or harm to others.
- Note expressions of hopelessness, worthlessness, or isolation.
- Identify physical symptoms of stress (e.g., racing heart, sleeplessness).

THERAPEUTIC TECHNIQUES TO CONSIDER:
- **Cognitive Reframing**: Gently challenge unhelpful thoughts (e.g., "Has there been a time in the past when you felt this worried? What happened then?").
- **Grounding Exercises**: For anxiety, suggest the 5-4-3-2-1 method or focusing on breath.
- **Breathing**: Suggest simple box breathing or 4-4-6 breathing.
- **Behavioral Activation**: For low mood, suggest a small, manageable activity.
- **Self-Compassion**: Encourage kindness towards oneself, especially when self-critical.

Remember: You're creating a safe, supportive space where the user feels heard, understood, and empowered. Be conversational and avoid overly clinical language. Blend validation, gentle questioning, and psychoeducation seamlessly.

Please respond with a JSON object matching the TherapeuticResponseOutput schema.`;

  return prompt;
});

export async function generateTherapeuticResponse(input: TherapeuticResponseInput): Promise<TherapeuticResponseOutput> {
  return therapeuticResponseFlow(input);
}

const therapeuticResponseFlow = ai.defineFlow(
  {
    name: 'therapeuticResponseFlow',
    inputSchema: TherapeuticResponseInputSchema,
    outputSchema: TherapeuticResponseOutputSchema,
  },
  async input => {
    const {output} = await therapeuticResponsePrompt(input);
    return output!;
  }
);

// ============================================================================
// 2. COMPREHENSIVE MENTAL HEALTH ASSESSMENT
// ============================================================================

const MentalHealthAssessmentInputSchema = z.object({
  responses: z.object({
    mood: z.string(),
    sleep: z.string(),
    appetite: z.string(),
    energy: z.string(),
    concentration: z.string(),
    socialInteraction: z.string(),
    stressors: z.array(z.string()),
    copingStrategies: z.array(z.string()),
    supportSystem: z.string(),
    substanceUse: z.string().optional(),
    selfHarmThoughts: z.boolean(),
    suicidalIdeation: z.boolean(),
  }),
  additionalContext: z.string().optional(),
});

const MentalHealthAssessmentOutputSchema = z.object({
  overallWellbeingScore: z.number().min(1).max(10),
  areasOfConcern: z.array(z.object({
    area: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    recommendations: z.array(z.string()),
  })),
  strengths: z.array(z.string()),
  immediateActionNeeded: z.boolean(),
  suggestedInterventions: z.array(z.object({
    type: z.enum(['self-help', 'peer-support', 'professional', 'crisis']),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
  })),
  personalized_message: z.string(),
});

export type MentalHealthAssessmentInput = z.infer<typeof MentalHealthAssessmentInputSchema>;
export type MentalHealthAssessmentOutput = z.infer<typeof MentalHealthAssessmentOutputSchema>;

const mentalHealthAssessmentPrompt = ai.definePrompt({
  name: 'mentalHealthAssessmentPrompt',
  input: {schema: MentalHealthAssessmentInputSchema},
  output: {schema: MentalHealthAssessmentOutputSchema},
  prompt: `You are conducting a comprehensive mental health assessment based on user-submitted data. Your tone should be professional, empathetic, and validating.

Assessment Responses: {{{responses}}}
{{#if additionalContext}}
Additional Context: {{{additionalContext}}}
{{/if}}

ASSESSMENT FRAMEWORK:
1. **Holistic Analysis**: Analyze the user's responses across biological, psychological, and social domains. Identify key patterns (e.g., link between poor sleep and low mood).
2. **Severity Assessment**: For each area of concern (e.g., "Depression symptoms", "Social isolation"), assign a severity level (mild, moderate, severe) based on the impact on functioning.
3. **Identify Strengths**: Actively look for protective factors and strengths, even small ones (e.g., "Reaching out for help," "Still journaling occasionally"). This is crucial for instilling hope.
4. **Actionable Recommendations**: For each area of concern, provide concrete, actionable recommendations.
5. **Prioritized Interventions**: Suggest a mix of interventions (professional, self-help, peer) and prioritize them (high, medium, low, urgent).
6. **Personalized Message**: Write a warm, personalized message that summarizes the findings in a non-clinical way. Validate their struggle, name the potential condition (e.g., "it sounds like depression"), emphasize it's not their fault, highlight their strength in reaching out, and convey a strong message of hope and the possibility of recovery.

INTERVENTION HIERARCHY:
1. Crisis intervention (immediate safety concerns).
2. Professional mental health services (severe symptoms).
3. Structured peer support or academic accommodations (moderate symptoms).
4. Self-help resources and coping strategies (mild symptoms).

Provide a holistic assessment that is validating, hopeful, and provides a clear, actionable path forward.`,
});

export async function assessMentalHealth(input: MentalHealthAssessmentInput): Promise<MentalHealthAssessmentOutput> {
  return mentalHealthAssessmentFlow(input);
}

const mentalHealthAssessmentFlow = ai.defineFlow(
  {
    name: 'mentalHealthAssessmentFlow',
    inputSchema: MentalHealthAssessmentInputSchema,
    outputSchema: MentalHealthAssessmentOutputSchema,
  },
  async input => {
    const {output} = await mentalHealthAssessmentPrompt(input);
    return output!;
  }
);

// ============================================================================
// 3. CRISIS INTERVENTION FLOW
// ============================================================================

const CrisisInterventionInputSchema = z.object({
  userMessage: z.string(),
  crisisType: z.enum(['suicidal', 'self-harm', 'panic', 'psychosis', 'violence', 'substance', 'other']),
  currentLocation: z.string().optional(),
  hasSupport: z.boolean(),
  previousAttempts: z.boolean().optional(),
});

const CrisisInterventionOutputSchema = z.object({
  immediateResponse: z.string(),
  safetyPlan: z.array(z.object({
    step: z.number(),
    action: z.string(),
    rationale: z.string(),
  })),
  copingTechniques: z.array(z.object({
    name: z.string(),
    instructions: z.string(),
    duration: z.string(),
  })),
  emergencyContacts: z.array(z.object({
    service: z.string(),
    contact: z.string(),
    availability: z.string(),
  })),
  followUpRequired: z.boolean(),
  escalationNeeded: z.boolean(),
});

export type CrisisInterventionInput = z.infer<typeof CrisisInterventionInputSchema>;
export type CrisisInterventionOutput = z.infer<typeof CrisisInterventionOutputSchema>;

const crisisInterventionPrompt = ai.definePrompt({
  name: 'crisisInterventionPrompt',
  input: {schema: CrisisInterventionInputSchema},
  output: {schema: CrisisInterventionOutputSchema},
  prompt: `You are a crisis intervention specialist. Your #1 priority is to keep the user safe. Your tone must be calm, direct, and supportive.

Crisis Situation: {{{userMessage}}}
Crisis Type: {{{crisisType}}}
Has Immediate Support: {{{hasSupport}}}

CRISIS INTERVENTION PROTOCOL:
1. **Immediate Validation & Connection**: Start by validating their pain and expressing gratitude that they reached out. Emphasize that you are there with them. Example: "I'm so glad you're reaching out right now instead of acting on these thoughts. That takes real courage... I want you to know that you're not alone in this moment."
2. **Develop an URGENT Safety Plan**: The safety plan must be a series of clear, direct, and immediate actions to ensure safety.
    - **Step 1: Means Restriction.** The very first step MUST be about creating distance from any means of harm mentioned.
    - **Step 2: Connect to Human Help.** The next steps must be about connecting to a live, trained professional (e.g., calling 988, Crisis Text Line, Campus Crisis Line).
    - **Step 3: Change Environment.** Instruct the user to go to a safe public space or be around others.
    - **Step 4: Emergency Services.** The final step must be to call 911 or go to an ER if thoughts intensify.
3. **Provide Immediate Coping Skills**: Offer 2-3 simple, powerful physiological techniques to interrupt the intense emotional state (e.g., face in ice water, intense exercise, 5-4-3-2-1 grounding). These are for immediate de-escalation.
4. **List Emergency Contacts**: Provide a clear, well-formatted list of national and local (if available) emergency contacts with numbers/instructions and availability.
5. **Flags**: Always set \`followUpRequired\` and \`escalationNeeded\` to \`true\` in a crisis of this nature.

Your response must be structured, clear, and prioritize action over open-ended conversation. This is an emergency response.`,
});

export async function handleCrisis(input: CrisisInterventionInput): Promise<CrisisInterventionOutput> {
  return crisisInterventionFlow(input);
}

const crisisInterventionFlow = ai.defineFlow(
  {
    name: 'crisisInterventionFlow',
    inputSchema: CrisisInterventionInputSchema,
    outputSchema: CrisisInterventionOutputSchema,
  },
  async input => {
    const {output} = await crisisInterventionPrompt(input);
    return output!;
  }
);

// ============================================================================
// 4. PSYCHOEDUCATION MODULE
// ============================================================================

const PsychoeducationInputSchema = z.object({
  topic: z.enum([
    'anxiety', 'depression', 'stress', 'trauma', 'relationships',
    'self-esteem', 'grief', 'anger', 'addiction', 'eating-disorders',
    'sleep', 'mindfulness', 'boundaries', 'communication', 'coping-skills'
  ]),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredFormat: z.enum(['explanation', 'exercises', 'strategies', 'mixed']),
  specificQuestions: z.array(z.string()).optional(),
});

const PsychoeducationOutputSchema = z.object({
  content: z.object({
    introduction: z.string(),
    keyConceptsExplained: z.array(z.object({
      concept: z.string(),
      explanation: z.string(),
      relevance: z.string(),
    })),
    practicalStrategies: z.array(z.object({
      strategy: z.string(),
      steps: z.array(z.string()),
      expectedOutcome: z.string(),
    })),
    exercises: z.array(z.object({
      name: z.string(),
      purpose: z.string(),
      instructions: z.array(z.string()),
      frequency: z.string(),
    })),
    commonMyths: z.array(z.object({
      myth: z.string(),
      reality: z.string(),
    })),
  }),
  additionalResources: z.array(z.string()),
  homework: z.array(z.string()).optional(),
});

export type PsychoeducationInput = z.infer<typeof PsychoeducationInputSchema>;
export type PsychoeducationOutput = z.infer<typeof PsychoeducationOutputSchema>;

const psychoeducationPrompt = ai.definePrompt({
  name: 'psychoeducationPrompt',
  input: {schema: PsychoeducationInputSchema},
  output: {schema: PsychoeducationOutputSchema},
  prompt: `You are an expert mental health educator. Your task is to create a comprehensive, easy-to-understand, and actionable psychoeducation module on the requested topic.

Topic: {{{topic}}}
User Level: {{{userLevel}}}
Format Preference: {{{preferredFormat}}}
{{#if specificQuestions}}
Specific Questions: {{{specificQuestions}}}
{{/if}}

PSYCHOEDUCATION STRUCTURE:
1.  **Introduction**: Start with a simple, normalizing metaphor. (e.g., Anxiety is like an oversensitive smoke detector).
2.  **Key Concepts**: Explain 3-4 core concepts. For each, provide a clear 'explanation' and then a 'relevance' section that connects it directly to the user's likely experience. If the user asks specific questions, answer them within this section.
3.  **Practical Strategies**: Provide 3-4 concrete, actionable strategies. For each, list the exact 'steps' and the 'expectedOutcome'.
4.  **Exercises**: Detail 1-2 structured exercises. For each, explain its 'purpose', provide clear 'instructions', and suggest a 'frequency'.
5.  **Common Myths**: Bust 2-3 common myths about the topic, each with a 'myth' and a corresponding 'reality'.
6.  **Additional Resources**: List 3-4 high-quality external resources (books, apps, websites).
7.  **Homework**: Suggest 2-3 specific, measurable homework tasks for the user to practice what they've learned.

CONTENT GUIDELINES:
- **Normalize, Don't Stigmatize**: Frame the topic as a common human experience.
- **Simplify Complexity**: Break down clinical ideas into simple terms.
- **Be Actionable**: Focus on what the user can *do*.
- **Set Realistic Expectations**: Emphasize that change takes practice.

Ensure the final output is well-organized, comprehensive, and empowers the user with both knowledge and practical tools.`,
});

export async function providePsychoeducation(input: PsychoeducationInput): Promise<PsychoeducationOutput> {
  return psychoeducationFlow(input);
}

const psychoeducationFlow = ai.defineFlow(
  {
    name: 'psychoeducationFlow',
    inputSchema: PsychoeducationInputSchema,
    outputSchema: PsychoeducationOutputSchema,
  },
  async input => {
    const {output} = await psychoeducationPrompt(input);
    return output!;
  }
);

// ============================================================================
// 5. THERAPEUTIC HOMEWORK & ACTIVITIES
// ============================================================================

const TherapeuticActivitiesInputSchema = z.object({
  primaryConcern: z.string(),
  availableTime: z.enum(['5min', '15min', '30min', '1hour', 'ongoing']),
  preferredActivities: z.array(z.enum([
    'journaling', 'meditation', 'exercise', 'creative', 'social',
    'cognitive', 'behavioral', 'mindfulness', 'self-care', 'skill-building'
  ])).optional(),
  currentMood: z.number().min(1).max(10),
  energyLevel: z.enum(['low', 'medium', 'high']),
});

const TherapeuticActivitiesOutputSchema = z.object({
  activities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    duration: z.string(),
    difficulty: z.enum(['easy', 'moderate', 'challenging']),
    instructions: z.array(z.string()),
    purpose: z.string(),
    expectedBenefit: z.string(),
    trackingMetric: z.string().optional(),
  })),
  weeklyPlan: z.object({
    monday: z.array(z.string()),
    tuesday: z.array(z.string()),
    wednesday: z.array(z.string()),
    thursday: z.array(z.string()),
    friday: z.array(z.string()),
    saturday: z.array(z.string()),
    sunday: z.array(z.string()),
  }).optional(),
  motivationalMessage: z.string(),
});

export type TherapeuticActivitiesInput = z.infer<typeof TherapeuticActivitiesInputSchema>;
export type TherapeuticActivitiesOutput = z.infer<typeof TherapeuticActivitiesOutputSchema>;

const therapeuticActivitiesPrompt = ai.definePrompt({
  name: 'therapeuticActivitiesPrompt',
  input: {schema: TherapeuticActivitiesInputSchema},
  output: {schema: TherapeuticActivitiesOutputSchema},
  prompt: `Design a set of personalized therapeutic activities for a user based on their current state and preferences. The activities should be creative, gentle, and designed for low motivation.

Primary Concern: {{{primaryConcern}}}
Available Time: {{{availableTime}}}
Current Mood: {{{currentMood}}}/10
Energy Level: {{{energyLevel}}}
{{#if preferredActivities}}
Preferred Activities: {{{preferredActivities}}}
{{/if}}

ACTIVITY DESIGN PRINCIPLES:
1.  **Behavioral Activation for Low Energy**: Design activities that are easy to start and provide a gentle sense of accomplishment. Focus on action before motivation.
2.  **Sensory & Creative Focus**: Emphasize activities that engage the senses and creativity to bypass cognitive-heavy tasks (e.g., 'Mindful Photography', 'Stream of Consciousness Drawing').
3.  **Self-Compassion**: The activities should be framed as acts of self-kindness, not chores.
4.  **Structure and Detail**: Provide very clear, step-by-step instructions for each activity. Include its purpose, expected benefit, and a simple tracking metric.
5.  **Weekly Plan**: Create a simple, sample weekly plan that integrates these activities. It should feel manageable, not overwhelming.
6.  **Motivational Message**: Write a powerful, empathetic message that acknowledges the difficulty of low motivation, normalizes it, and explains the principle of "action before feeling." It should be encouraging and patient.

Create a list of 3-4 diverse activities tailored to the input. Ensure they are achievable given the user's low energy and mood.`,
});

export async function generateTherapeuticActivities(input: TherapeuticActivitiesInput): Promise<TherapeuticActivitiesOutput> {
  return therapeuticActivitiesFlow(input);
}

const therapeuticActivitiesFlow = ai.defineFlow(
  {
    name: 'therapeuticActivitiesFlow',
    inputSchema: TherapeuticActivitiesInputSchema,
    outputSchema: TherapeuticActivitiesOutputSchema,
  },
  async input => {
    const {output} = await therapeuticActivitiesPrompt(input);
    return output!;
  }
);

// ============================================================================
// 6. PEER SUPPORT MODERATION & GUIDANCE
// ============================================================================

const PeerSupportModerationInputSchema = z.object({
  message: z.string(),
  conversationContext: z.array(z.object({
    author: z.string(),
    content: z.string(),
    timestamp: z.string(),
  })).optional(),
  messageType: z.enum(['initial-post', 'reply', 'advice', 'sharing']),
});

const PeerSupportModerationOutputSchema = z.object({
  safetyCheck: z.object({
    isAppropriate: z.boolean(),
    concerns: z.array(z.string()).optional(),
    suggestedEdits: z.array(z.string()).optional(),
  }),
  enhancedMessage: z.string().optional(),
  suggestedResponses: z.array(z.object({
    tone: z.enum(['supportive', 'empathetic', 'encouraging', 'practical']),
    response: z.string(),
  })),
  peerSupportGuidance: z.array(z.string()),
  redactedContent: z.string(),
});

export type PeerSupportModerationInput = z.infer<typeof PeerSupportModerationInputSchema>;
export type PeerSupportModerationOutput = z.infer<typeof PeerSupportModerationOutputSchema>;

const peerSupportModerationPrompt = ai.definePrompt({
  name: 'peerSupportModerationPrompt',
  input: {schema: PeerSupportModerationInputSchema},
  output: {schema: PeerSupportModerationOutputSchema},
  prompt: `You are a peer support moderator. Your job is to ensure safety, provide guidance, and enhance the quality of interactions. Analyze the following message.

Message: {{{message}}}
Message Type: {{{messageType}}}
{{#if conversationContext}}
Context: {{{conversationContext}}}
{{/if}}

MODERATION TASKS:
1.  **Safety Check**:
    -   Set \`isAppropriate\` to \`false\` if ANY red flags are present.
    -   List all specific \`concerns\` (e.g., "Shares PII," "Recommends illegal substance use," "Gives medical advice").
    -   Provide clear \`suggestedEdits\` to make the post safe.
2.  **Redact PII**: Create a \`redactedContent\` version of the message. Aggressively redact any PII (names, specific locations, phone numbers) and any clearly harmful/illegal advice (e.g., sharing medication). Replace with \`[REDACTED]\`.
3.  **Enhance Message**: Rewrite the post into an \`enhancedMessage\`. This version should be safe, constructive, and model good peer support. Use "I" statements, remove unsafe advice, and reframe absolute claims (e.g., "it fixes everything") into more nuanced experiences (e.g., "I found it helpful for...").
4.  **Suggest Replies**: Generate 3 \`suggestedResponses\` for others to use when replying to the *original poster* (not the message being moderated). These should model good peer support: be open-ended, empathetic, and seek clarification.
5.  **Provide Guidance**: Offer a list of \`peerSupportGuidance\` points directly to the author of the message. This should praise what they did well (e.g., "Great job using 'I' statements") and offer gentle correction on what to avoid (e.g., "Remember to avoid sharing specific medical provider info").

RED FLAGS TO IDENTIFY:
-   PII: Names, addresses, phone numbers, specific locations.
-   Harmful Advice: Recommending illegal activities, sharing prescription drugs, promoting self-harm.
-   Medical/Psychiatric Advice: Pretending to be a doctor, diagnosing, prescribing.
-   Absolute Claims: "This will cure you," "It fixes everything."
-   Boundary Violations: Offering to meet up, sharing personal contact info.

Your output must be thorough and prioritize the safety and health of the community above all.`,
});

export async function moderatePeerSupport(input: PeerSupportModerationInput): Promise<PeerSupportModerationOutput> {
  return peerSupportModerationFlow(input);
}

const peerSupportModerationFlow = ai.defineFlow(
  {
    name: 'peerSupportModerationFlow',
    inputSchema: PeerSupportModerationInputSchema,
    outputSchema: PeerSupportModerationOutputSchema,
  },
  async input => {
    const {output} = await peerSupportModerationPrompt(input);
    return output!;
  }
);
