# Claude AI Quick Start Guide

## 🚀 5-Minute Setup

### 1. Get Your API Key (2 min)
1. Go to: **https://console.anthropic.com**
2. Sign up/Login → **Settings** → **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-`)
4. You get **$5 free credits** (≈1000 Silk messages!)

### 2. Add to Your Project (1 min)
```bash
# Edit your .env file
echo "VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

OR manually add to `.env`:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### 3. Restart Dev Server (1 min)
```bash
# Stop current server (Ctrl+C), then:
npm run dev
```

### 4. Test It! (1 min)
1. Open http://localhost:5173
2. Click **Silk** tab (chat icon)
3. Type: **"Who should I reach out to?"**
4. Get an intelligent, personalized response! ✨

---

## What You Can Do Now

### Talk to Silk Naturally:
```
"I hung out with Sarah yesterday"
"Move Marcus to P1 priority"
"Who haven't I talked to in a while?"
"Tell me about my work connections"
"Show me people who need attention"
"What's my network health?"
```

### Features Now Enabled:
✅ **Natural language processing** - Silk understands context
✅ **Relationship analysis** - AI-powered insights
✅ **Personalized suggestions** - Reconnection ideas
✅ **Smart reminders** - Context-aware notifications
✅ **Conversation memory** - Silk remembers your chats

---

## Cost & Usage

**Free tier:** $5 = ~1000 messages (perfect for testing!)

**Typical costs:**
- 1 Silk message: ~$0.002 (0.2 cents)
- Daily active use: ~$0.15/day = $4.50/month
- Your free credit lasts ~33 days

**Monitor usage:** https://console.anthropic.com/usage

---

## Troubleshooting

**Issue: "Claude AI is not configured"**
- ✅ Check `.env` has `VITE_ANTHROPIC_API_KEY=sk-ant-...`
- ✅ Restart dev server: `npm run dev`

**Issue: Slow responses**
- Normal! First request may take 2-3 seconds
- Subsequent requests are faster

**Issue: API errors**
- Check your key at https://console.anthropic.com/settings/keys
- Verify you have credits remaining

---

## Next Steps

📖 **Read the full guide:** [CLAUDE_SETUP_GUIDE.md](CLAUDE_SETUP_GUIDE.md)
- Production deployment strategies
- Advanced customization
- Security best practices
- Cost optimization

---

## That's It!

You now have a production-grade AI assistant powering your relationship management app. 🎉

Questions? Check [CLAUDE_SETUP_GUIDE.md](CLAUDE_SETUP_GUIDE.md) or ask the team!
