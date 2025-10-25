# Google Gemini AI Integration Guide

## ✅ Already Configured!

Good news - Gemini AI is already set up and ready to use! Your API key is configured in the `.env` file.

---

## 🚀 Quick Start

### 1. Verify Setup
Your `.env` file should have:
```env
VITE_GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyDi3D69XdSyQ6jV8SbiNs564C9Rwk9NzX4"
```

✅ This is already done!

### 2. Start the App
```bash
npm run dev
```

### 3. Test Silk Assistant
1. Open http://localhost:5174 (or whatever port Vite shows)
2. Click the **Silk** tab (chat icon)
3. Try these commands:
```
"Who should I reach out to?"
"I hung out with Sarah yesterday"
"Tell me about my connections"
"Show me my work connections"
```

---

## 🎯 What Gemini Powers

### Silk AI Assistant
- **Natural language processing** - Understands conversational inputs
- **Context-aware responses** - Remembers your conversation
- **Relationship intelligence** - Analyzes your social network
- **Personalized suggestions** - Reconnection ideas based on your connections

### Example Interactions
```
User: "I had coffee with Marcus yesterday"
Silk: ✅ Logged your interaction with Marcus! Their relationship
      strength has been updated. Great to see you're staying
      connected with your P1 contacts!

User: "Who needs attention?"
Silk: Here are people you should reach out to:

      🔴 Overdue P1 contacts:
      • Sarah (12 days) - Your goal is weekly contact

      ⚠️ Low strength connections:
      • Jeremy (2⭐) - Last contact: 18 days ago
```

---

## 🛠️ Tech Stack

### Using Vercel AI SDK
We're using the same AI SDK you used in your Svelte Bible app:

```typescript
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
});

const { text } = await generateText({
  model: google('gemini-2.0-flash-exp'),
  prompt: yourPrompt,
  maxTokens: 500,
  temperature: 0.7,
});
```

### Files
- **`src/lib/gemini.ts`** - Main Gemini service
- **`src/services/intelligenceService.ts`** - AI-powered insights
- **`src/contexts/SilkContext.tsx`** - Silk assistant logic

---

## 💰 Pricing & Limits

### Gemini 2.0 Flash (Free Tier)
- **15 requests per minute (RPM)**
- **1 million tokens per minute**
- **1500 requests per day**

This is **completely free** and perfect for:
- ✅ Development and testing
- ✅ Hackathon demos
- ✅ MVP with < 100 active users
- ✅ Personal use

### Usage Estimates
- **Per Silk message:** ~500-1000 tokens
- **1500 requests/day** = plenty for active development
- **Cost:** $0 (free tier is generous!)

### Monitor Usage
Check your API usage at: https://aistudio.google.com/app/apikey

---

## 🎨 Features You Can Use

### 1. Natural Language Interaction Logging
```
"I hung out with Sarah yesterday"
"Had coffee with John this morning"
"Called my mom today"
```

### 2. Priority Management
```
"Move Marcus to P1"
"Set Sarah as priority 2"
"Change Lisa to P3"
```

### 3. Network Queries
```
"Who should I reach out to?"
"Show me my work connections"
"Tell me about Jeremy"
"Who needs attention this week?"
```

### 4. Statistics & Analysis
```
"What's my network health?"
"Show me my stats"
"How many family connections do I have?"
```

### 5. AI-Powered Insights
```typescript
import { IntelligenceService } from './services/intelligenceService';

// Get daily insights
const insights = await IntelligenceService.getDailyInsights(connections);

// Get personalized suggestions
const suggestions = await IntelligenceService.getActionableSuggestions(connections);

// Analyze network health
const analysis = await analyzeRelationshipHealth(connections);
```

---

## 🔧 Customization

### Change the AI Model
Edit `src/lib/gemini.ts`:
```typescript
model: google('gemini-2.0-flash-exp'), // Fast, free
// or
model: google('gemini-1.5-pro'),      // More capable
// or
model: google('gemini-1.5-flash'),    // Good balance
```

### Adjust Response Length
```typescript
maxTokens: 500,  // Current (concise)
maxTokens: 1000, // Longer responses
maxTokens: 200,  // Very brief
```

### Change Temperature (Creativity)
```typescript
temperature: 0.7, // Balanced (current)
temperature: 0.3, // More focused/deterministic
temperature: 0.9, // More creative/varied
```

### Customize Silk's Personality
Edit the system prompt in `src/lib/gemini.ts`:
```typescript
## Your Personality:
- Super casual and fun         // Change this
- Uses lots of emojis 🎉       // to whatever
- Like a friend, not assistant // you want!
```

---

## 🐛 Troubleshooting

### Issue: "Gemini AI is not configured"
**Solution:**
1. Check `.env` has the API key
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Issue: API Key Error
**Solution:**
1. Verify the key at: https://aistudio.google.com/app/apikey
2. Make sure it's active (not expired)
3. Check there are no extra spaces in `.env`

### Issue: Rate Limit Errors
**Solution:**
- Free tier: 15 requests/min
- Wait 60 seconds and try again
- For production, implement request queuing

### Issue: Responses are slow
**Normal for first request:**
- First request: 2-3 seconds (cold start)
- Subsequent: < 1 second

**If always slow:**
- Check your internet connection
- Try `gemini-1.5-flash` (faster model)

---

## 🚀 Production Considerations

### Security (Important!)
**Current setup:** API key is in browser environment variables

**For production:**
Create a backend API endpoint (Supabase Edge Function recommended):

```typescript
// supabase/functions/gemini/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { generateText } from 'npm:ai'
import { createGoogleGenerativeAI } from 'npm:@ai-sdk/google'

serve(async (req) => {
  const { message, connections } = await req.json()

  // API key is server-side only!
  const google = createGoogleGenerativeAI({
    apiKey: Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
  })

  const { text } = await generateText({
    model: google('gemini-2.0-flash-exp'),
    prompt: buildPrompt(message, connections),
    maxTokens: 500,
  })

  return new Response(JSON.stringify({ response: text }))
})
```

Then update frontend:
```typescript
// src/lib/gemini.ts
export async function askGemini(message, connections) {
  const response = await fetch('/functions/v1/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, connections })
  })

  const data = await response.json()
  return data.response
}
```

### Rate Limiting
Add rate limiting to prevent abuse:
```typescript
// Max 30 requests per user per minute
const rateLimit = new Map();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  const recentRequests = userRequests.filter(t => now - t < 60000);

  if (recentRequests.length >= 30) {
    throw new Error('Rate limit exceeded');
  }

  rateLimit.set(userId, [...recentRequests, now]);
}
```

### Caching
Cache common responses to reduce API calls:
```typescript
const cache = new Map();

export async function askGemini(message, connections) {
  const cacheKey = `${message}-${connections.length}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const response = await generateText({...});
  cache.set(cacheKey, response);

  return response;
}
```

---

## 📊 Comparison: Gemini vs Claude

| Feature | Gemini 2.0 Flash | Claude 3.5 Sonnet |
|---------|------------------|-------------------|
| **Free Tier** | ✅ 1500 req/day | ❌ $5 credit only |
| **Speed** | ⚡ Very fast | 🐢 Slower |
| **Quality** | ⭐⭐⭐⭐ Great | ⭐⭐⭐⭐⭐ Excellent |
| **Cost (paid)** | Free tier enough | ~$0.002/message |
| **Context Window** | 1M tokens | 200K tokens |
| **Best For** | Development, MVP | Production, complex tasks |

**For your hackathon:** Gemini is perfect! ✅

---

## 🎉 Summary

**What you have:**
- ✅ Gemini AI fully integrated
- ✅ Silk assistant powered by AI
- ✅ Natural language processing
- ✅ Free tier (1500 requests/day)
- ✅ Ready to demo!

**What's already configured:**
- ✅ API key in `.env`
- ✅ Vercel AI SDK installed
- ✅ Gemini service created
- ✅ SilkContext updated

**Next steps:**
1. ✅ App is ready - just test it!
2. Open http://localhost:5174
3. Go to Silk tab
4. Start chatting!

---

## 📚 Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Vercel AI SDK:** https://sdk.vercel.ai/docs
- **Get API Key:** https://aistudio.google.com/app/apikey
- **Monitor Usage:** https://aistudio.google.com/app/apikey

---

## 🤝 Team

- **Joel** - Lead Developer
- **Samuel** - Developer
- **Rianna** - Developer
- **Ian** - Developer

Powered by Google Gemini AI 🤖✨
