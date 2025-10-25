# Claude AI Integration Guide for WEB App

This guide explains how Claude AI powers the Silk assistant and backend intelligence features in the WEB relationship management app.

## Table of Contents
1. [Overview](#overview)
2. [Getting Your Anthropic API Key](#getting-your-anthropic-api-key)
3. [Setup Instructions](#setup-instructions)
4. [Architecture](#architecture)
5. [Features Powered by Claude](#features-powered-by-claude)
6. [API Usage & Costs](#api-usage--costs)
7. [Production Considerations](#production-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Claude AI (by Anthropic) is integrated into WEB as:
1. **Silk AI Assistant** - Natural language chatbot for managing relationships
2. **Backend Intelligence** - Relationship analysis, insights, and suggestions
3. **Data Sync Coordinator** - Helps maintain consistency across your network

### What Claude Does:
- Processes natural language inputs ("I hung out with Sarah yesterday")
- Analyzes relationship health and patterns
- Generates personalized reconnection suggestions
- Provides actionable insights about your social network
- Understands context from your entire relationship history

---

## Getting Your Anthropic API Key

### Step 1: Create an Anthropic Account
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up for an account (or log in if you have one)
3. You'll receive **$5 in free credits** to start

### Step 2: Generate an API Key
1. Navigate to **Settings** → **API Keys**
2. Click **"Create Key"**
3. Give it a name (e.g., "WEB App Development")
4. Copy the API key (it starts with `sk-ant-...`)
5. **Important**: Store this key securely - you won't be able to see it again!

### Step 3: Add Credits (if needed)
- The free $5 should be enough for testing and light usage
- For production use, add credits at **Settings** → **Billing**
- Recommended: Start with $20-50 for development

---

## Setup Instructions

### 1. Environment Configuration

**Option A: Update your existing `.env` file**
```bash
# Edit your .env file
nano .env
```

Add this line:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Option B: Copy from example**
```bash
# Copy the example file
cp .env.example .env

# Then edit it with your actual keys
nano .env
```

Your `.env` should look like:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Anthropic Claude API Configuration
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### 2. Restart Your Development Server

```bash
# Kill the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### 3. Test the Integration

1. Open the app at `http://localhost:5173`
2. Navigate to the **Silk** tab (chat icon)
3. Try a command:
   - "Who should I reach out to?"
   - "Analyze my network health"
   - "Tell me about my connections"

If Claude is working, you'll get intelligent, context-aware responses!

---

## Architecture

### File Structure
```
src/
├── lib/
│   └── claude.ts              # Core Claude API integration
├── services/
│   └── intelligenceService.ts # AI-powered insights & analysis
├── contexts/
│   └── SilkContext.tsx        # Silk assistant (uses Claude)
```

### How It Works

1. **User sends message** → Silk Assistant
2. **SilkContext** processes the message:
   - Extracts conversation history
   - Converts to Claude-compatible format
   - Sends to Claude API with system prompt
3. **Claude responds** with intelligent answer
4. **SilkContext** performs any actions (logging, updating)
5. **Response displayed** to user

### System Prompt

Claude is given context about:
- All your connections (name, relationship, priority, strength)
- Days since last contact for each person
- Your priority system (P1/P2/P3)
- Recent conversation history

This allows Claude to give personalized, accurate responses.

---

## Features Powered by Claude

### 1. **Silk AI Assistant** (Main Chatbot)
- Natural language understanding
- Context-aware conversations
- Remembers past interactions
- Personality: warm, supportive, data-driven

**Example commands:**
```
"I hung out with Marcus yesterday"
"Who haven't I talked to in a while?"
"Move Sarah to P1 priority"
"Tell me about Jeremy"
"Show me my work connections"
"What's my network health?"
```

### 2. **Relationship Health Analysis**
```typescript
import { analyzeRelationshipHealth } from './lib/claude';

const insights = await analyzeRelationshipHealth(connections);
```

Claude analyzes your entire network and provides:
- Specific actionable insights
- Pattern identification
- Health warnings
- Positive reinforcement

### 3. **Personalized Reconnection Suggestions**
```typescript
import { generateReconnectionSuggestion } from './lib/claude';

const suggestion = await generateReconnectionSuggestion(connection);
// Returns: "It's been 23 days since you connected with Sarah.
// Given her interest in hiking, suggest planning a weekend trail together!"
```

### 4. **Intelligence Service** (Advanced Features)
```typescript
import { IntelligenceService } from './services/intelligenceService';

// Daily insights
const insights = await IntelligenceService.getDailyInsights(connections);

// Weekly reports
const report = await IntelligenceService.getWeeklyReport(connections);

// Smart reminders
const reminders = await IntelligenceService.generateSmartReminders(connections);
```

---

## API Usage & Costs

### Claude 3.5 Sonnet Pricing
- **Input**: $3 per million tokens (~$0.003 per 1K tokens)
- **Output**: $15 per million tokens (~$0.015 per 1K tokens)

### Typical Usage Estimates

**Per Silk conversation:**
- Input: ~500-1000 tokens (system prompt + user history)
- Output: ~100-300 tokens (response)
- **Cost per message**: ~$0.002-0.005 (less than half a cent)

**Daily usage for active user:**
- 20 Silk messages: ~$0.10
- 3 analysis requests: ~$0.05
- **Total**: ~$0.15/day = **$4.50/month**

**Free tier ($5 credit) lasts:**
- ~33 days of active daily use
- ~1000 Silk messages
- Perfect for development and testing!

### Monitoring Usage
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Navigate to **Usage**
3. See real-time token counts and costs

---

## Production Considerations

### Security

**Current Setup (Development):**
```typescript
const anthropic = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true // ⚠️ Exposes API key in browser
});
```

**Production Setup (Recommended):**

Create a backend API endpoint:

```typescript
// backend/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY // Server-side only
});

export async function POST(request: Request) {
  const { message, connections, history } = await request.json();

  // Add authentication check here
  const user = await authenticateUser(request);

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: generateSilkSystemPrompt(connections),
    messages: [...history, { role: 'user', content: message }]
  });

  return Response.json({ response: response.content[0].text });
}
```

Then update frontend:
```typescript
// src/lib/claude.ts
export async function askClaude(message, connections, history) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, connections, history })
  });

  const data = await response.json();
  return data.response;
}
```

### Rate Limiting
Implement rate limiting to prevent abuse:
```typescript
// Limit to 30 requests per minute per user
const rateLimit = {
  maxRequests: 30,
  windowMs: 60000
};
```

### Caching
Cache common responses to reduce API calls:
```typescript
const cache = new Map();

export async function askClaude(message, connections, history) {
  const cacheKey = `${message}-${connections.length}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const response = await anthropic.messages.create({...});
  cache.set(cacheKey, response);

  return response;
}
```

### Error Handling
```typescript
try {
  const response = await askClaude(message, connections, history);
  return response;
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    return "I'm receiving too many requests. Please try again in a moment.";
  } else if (error.status === 401) {
    // Invalid API key
    return "Authentication error. Please check your API configuration.";
  } else {
    // Log error for debugging
    console.error('Claude API error:', error);
    return "I'm having trouble right now. Please try again.";
  }
}
```

---

## Troubleshooting

### Issue: "Claude AI is not configured"
**Solution:**
1. Check if `VITE_ANTHROPIC_API_KEY` exists in `.env`
2. Verify the key starts with `sk-ant-`
3. Restart your dev server: `npm run dev`

### Issue: "Invalid API key" error
**Solution:**
1. Verify your API key at https://console.anthropic.com/settings/keys
2. Make sure there are no extra spaces in `.env`
3. Regenerate the key if needed

### Issue: Claude responses are slow
**Solution:**
1. Reduce `max_tokens` in `claude.ts` (currently 1024)
2. Implement caching for common queries
3. Use streaming responses (advanced)

### Issue: High API costs
**Solution:**
1. Implement caching
2. Reduce conversation history length (currently last 10 messages)
3. Use Claude Haiku (cheaper model) for simple tasks
4. Add rate limiting

### Issue: Responses aren't contextual
**Solution:**
1. Check that connections are being passed correctly
2. Verify the system prompt includes connection data
3. Ensure conversation history is being maintained

---

## Advanced Customization

### Change Claude Model
Edit `src/lib/claude.ts`:
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307', // Faster, cheaper
  // or
  model: 'claude-3-5-sonnet-20241022', // Smartest (default)
  // or
  model: 'claude-3-opus-20240229', // Most capable
  ...
});
```

### Adjust Response Length
```typescript
max_tokens: 512,  // Shorter responses
max_tokens: 2048, // Longer, more detailed
```

### Customize Silk's Personality
Edit the system prompt in `src/lib/claude.ts`:
```typescript
## Your Personality:
- More casual and fun
- Uses more emojis
- Cracks occasional jokes
- etc.
```

---

## Next Steps

### For Development:
1. ✅ Add your API key to `.env`
2. ✅ Test Silk assistant features
3. ✅ Monitor usage in Anthropic console
4. Customize prompts for your use case
5. Implement additional intelligence features

### For Production:
1. Create backend API endpoint
2. Implement authentication
3. Add rate limiting
4. Set up error monitoring
5. Configure caching strategy
6. Add analytics tracking

---

## Support & Resources

- **Anthropic Documentation**: https://docs.anthropic.com
- **Claude API Reference**: https://docs.anthropic.com/claude/reference
- **WEB App Repository**: https://github.com/calebnewtonusc/webcalhacks25
- **Issues**: Report bugs in GitHub Issues

---

## Team

- **Joel** - Lead Developer
- **Samuel** - Developer
- **Rianna** - Developer
- **Ian** - Developer

Built with Claude AI by Anthropic
