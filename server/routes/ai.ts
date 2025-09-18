import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

// Therapeutic chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { userMessage, conversationHistory } = req.body;
    
    // Basic validation
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    console.log('Received chat request:', { userMessage, historyLength: conversationHistory?.length || 0 });

    // Build conversation context
    let contextPrompt = '';
    if (conversationHistory && conversationHistory.length > 0) {
      contextPrompt = '\n\nPrevious conversation:\n';
      conversationHistory.slice(-5).forEach((msg: any) => {
        contextPrompt += `${msg.role === 'user' ? 'User' : 'Counselor'}: ${msg.content}\n`;
      });
    }

    const therapeuticPrompt = `You are a professional, empathetic AI counselor trained in evidence-based therapeutic approaches including CBT, DBT, and person-centered therapy. Your role is to provide supportive, non-judgmental guidance while maintaining professional boundaries.

THERAPEUTIC GUIDELINES:
1. **Active Listening & Empathy First**: Always acknowledge and validate the user's feelings. Use reflective listening. Normalize their experience.
2. **Collaborative Stance**: Use "we" language. Partner with the user. Give them choices on where to take the conversation.
3. **Pacing**: Don't rush to solutions. First, listen and explore. However, if the user directly asks for suggestions or "what to do," provide a few clear, actionable strategies.
4. **Strength-Based**: Identify and build upon the user's existing strengths. Reframe help-seeking as a strength.
5. **Safety Priority**: Assess for risk indicators while maintaining therapeutic rapport.

RESPONSE STRUCTURE:
1. **Emotional Validation**: Start with a strong acknowledgment of their feelings and normalize the experience.
2. **Gentle Exploration**: Use gentle, open-ended questions to understand more.
3. **Offer Support**: Provide practical coping strategies when appropriate.
4. **Empowering Closing**: End with a hopeful and encouraging statement.

RISK ASSESSMENT:
- Screen for suicidal ideation, self-harm, or harm to others.
- Note expressions of hopelessness, worthlessness, or isolation.

Remember: You're creating a safe, supportive space where the user feels heard, understood, and empowered. Be conversational and avoid overly clinical language.

${contextPrompt}

Current user message: ${userMessage}

Please respond as a caring counselor would, keeping your response concise but meaningful (2-4 sentences).`;

    console.log('Calling Google AI...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(therapeuticPrompt);
    const aiResponse = result.response.text();

    // Assess emotional tone and risk level based on user message
    const emotionalTone = assessEmotionalTone(userMessage);
    const riskLevel = assessRiskLevel(userMessage);

    const response = {
      response: aiResponse,
      emotionalTone,
      riskIndicators: {
        level: riskLevel,
        flags: riskLevel !== 'none' ? ['Requires attention'] : []
      }
    };
    
    console.log('AI response generated successfully');
    
    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper functions for assessment
function assessEmotionalTone(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    return 'supportive';
  } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    return 'empathetic';
  } else if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated')) {
    return 'validating';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
    return 'exploratory';
  }
  
  return 'encouraging';
}

function assessRiskLevel(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('kill') || lowerMessage.includes('suicide') || lowerMessage.includes('end it all') || lowerMessage.includes('better off dead')) {
    return 'critical';
  } else if (lowerMessage.includes('hurt myself') || lowerMessage.includes('self harm') || lowerMessage.includes('cut myself')) {
    return 'high';
  } else if (lowerMessage.includes('hopeless') || lowerMessage.includes('worthless') || lowerMessage.includes('no point')) {
    return 'moderate';
  } else if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('can\'t cope')) {
    return 'low';
  }
  
  return 'none';
}

export default router;