# AI Chatbot Setup Guide

Your Genkit-powered AI counselor chatbot is now ready! Here's what you need to do to get it running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set up Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the API key and replace `your_google_ai_api_key_here` in your `.env` file:

```env
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

## 3. Start the Development Server

```bash
npm run dev
```

## 4. Test Your Chatbot

1. Open your browser to `http://localhost:5173`
2. Navigate to the `/chat` page
3. Start chatting with your AI counselor!

## Features Implemented

✅ **Therapeutic Conversation Flow** - Professional, empathetic responses using CBT, DBT, and person-centered therapy approaches

✅ **Mental Health Assessment** - Comprehensive evaluation with actionable recommendations

✅ **Crisis Intervention** - Safety-first approach with immediate response protocols

✅ **Psychoeducation** - Educational content on various mental health topics

✅ **Therapeutic Activities** - Personalized homework and coping strategies

✅ **Peer Support Moderation** - Content safety and enhancement for community features

## Chat Interface Features

- Real-time AI-powered responses
- Conversation history
- Emotional tone indicators
- Risk level monitoring
- PHQ-9 screening integration
- Breathing exercises
- Grounding techniques
- Quick response buttons

## Available AI Flows

You can extend the chatbot by using these additional flows in your API routes:

- `assessMentalHealth()` - For comprehensive assessments
- `handleCrisis()` - For crisis situations
- `providePsychoeducation()` - For educational content
- `generateTherapeuticActivities()` - For personalized activities
- `moderatePeerSupport()` - For community moderation

## Next Steps

1. Customize the therapeutic prompts in `client/ai/flows.ts`
2. Add more API endpoints in `server/routes/ai.ts`
3. Integrate additional flows into your chat interface
4. Add user authentication and conversation persistence
5. Implement crisis escalation protocols

Your AI counselor is ready to provide professional, empathetic support to users! 🤖💙