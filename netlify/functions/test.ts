import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'AI Chatbot API is working!',
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.GOOGLE_GENAI_API_KEY,
      environment: process.env.NODE_ENV || 'development'
    }),
  };
};