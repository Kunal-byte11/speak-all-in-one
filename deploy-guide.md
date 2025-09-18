# 🚀 Netlify Deployment Guide for AI Counselor Chatbot

Your AI counselor chatbot is ready to deploy to Netlify! Follow these steps:

## 📋 Pre-Deployment Checklist

✅ **Dependencies**: Google AI package is installed
✅ **Netlify Config**: `netlify.toml` is configured
✅ **Functions**: Serverless function is set up
✅ **Build Scripts**: Build commands are ready

## 🔧 Step 1: Environment Variables

You need to set your environment variables in Netlify:

1. Go to your Netlify dashboard
2. Select your site (or create a new one)
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

```
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__
PING_MESSAGE=ping pong
```

## 🚀 Step 2: Deploy Options

### Option A: Git-based Deployment (Recommended)

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Add AI counselor chatbot with Google AI"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your repository
   - Netlify will auto-detect the settings from `netlify.toml`

### Option B: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Install Netlify CLI: `npm install -g netlify-cli`
   - Login: `netlify login`
   - Deploy: `netlify deploy --prod --dir=dist/spa`

## 🔧 Step 3: Build Configuration

Your `netlify.toml` is already configured with:

- **Build command**: `npm run build:client`
- **Publish directory**: `dist/spa`
- **Functions directory**: `netlify/functions`
- **API redirects**: `/api/*` → `/.netlify/functions/api/*`

## 🧪 Step 4: Test Your Deployment

After deployment, test these endpoints:

1. **Main site**: `https://your-site.netlify.app`
2. **API health check**: `https://your-site.netlify.app/api/ping`
3. **AI test endpoint**: `https://your-site.netlify.app/.netlify/functions/test`
4. **AI chat**: `https://your-site.netlify.app/api/ai/chat` (POST request)

### Test the AI Chat Function:

```bash
curl -X POST https://your-site.netlify.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "I feel stressed"}'
```

## 🎯 Features Deployed

✅ **AI-Powered Chat**: Google Gemini 2.0 Flash integration
✅ **Therapeutic Responses**: Professional counseling approach
✅ **Risk Assessment**: Automatic risk level detection
✅ **Responsive UI**: Works on all devices
✅ **Real-time Chat**: Instant AI responses
✅ **Wellness Tools**: Breathing exercises, grounding techniques

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript types are correct

2. **API Not Working**:
   - Verify `GOOGLE_GENAI_API_KEY` is set in Netlify environment variables
   - Check function logs in Netlify dashboard

3. **404 Errors**:
   - Ensure redirects are working (check `netlify.toml`)
   - Verify build output is in `dist/spa`

### Debug Commands:

```bash
# Test build locally
npm run build

# Test functions locally (if you have Netlify CLI)
netlify dev

# Check environment variables
netlify env:list
```

## 🎉 You're Ready!

Your AI counselor chatbot will be live at: `https://your-site-name.netlify.app`

The chatbot includes:
- Professional therapeutic responses
- Crisis intervention protocols
- Mental health assessments
- Personalized coping strategies
- Real-time risk monitoring

## 🔐 Security Notes

- API key is securely stored in Netlify environment variables
- All conversations are processed server-side
- No sensitive data is stored client-side
- HTTPS encryption for all communications

Happy deploying! 🚀