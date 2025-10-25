import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.warn('Google Generative AI API key not found. Gemini AI features will be limited.');
}

export const google = apiKey ? createGoogleGenerativeAI({
  apiKey
}) : null;

export interface Connection {
  id: string;
  name: string;
  relationship: string;
  priority: string;
  strength: number;
  lastContact: Date;
  interactions: any[];
  notes?: string;
  tags?: string[];
  phone?: string;
  email?: string;
}

export interface SilkMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a system prompt for Silk AI based on user's connections
 */
export function generateSilkSystemPrompt(connections: Connection[]): string {
  const connectionSummary = connections.map(c => {
    const daysSinceContact = Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24));
    return `- ${c.name}: ${c.relationship}, ${c.priority} priority, Strength: ${c.strength}/5, Last contact: ${daysSinceContact} days ago, Interactions: ${c.interactions.length}`;
  }).join('\n');

  return `You are Silk, an intelligent relationship management assistant for the WEB app - a personal relationship intelligence platform. Your role is to help users maintain meaningful connections by:

1. **Logging Interactions**: Process natural language inputs like "I hung out with Sarah yesterday" and log them
2. **Analyzing Relationships**: Identify people who need attention based on priority and last contact
3. **Providing Insights**: Offer suggestions about relationship health and patterns
4. **Managing Data**: Update priorities, categories, and connection information
5. **Answering Questions**: Provide information about connections and network statistics

## Current User's Network:
${connectionSummary || 'No connections yet.'}

## Priority System:
- **P1**: Weekly contact goal (7 days)
- **P2**: Bi-weekly contact goal (14 days)
- **P3**: Monthly contact goal (30 days)

## Strength Scoring (1-5):
- 5: Excellent relationship, regular contact
- 4: Good relationship, on track
- 3: Neutral, could use attention
- 2: Warning, relationship fading
- 1: Critical, needs immediate attention

## Your Personality:
- Warm, supportive, and encouraging
- Proactive about relationship health
- Data-driven but empathetic
- Concise and actionable (keep responses 2-4 sentences for simple queries)
- Never guilt-inducing, always motivating

## Response Guidelines:
- Keep responses concise and friendly
- Use emojis sparingly (✅ 🔴 ⭐ only when helpful)
- When logging interactions, confirm what was logged
- When unable to find a person, suggest alternatives
- Provide specific, actionable suggestions
- Format lists clearly with bullet points when needed

## Natural Language Understanding:
You can understand and process:
- Interaction logging: "I had coffee with John yesterday"
- Priority updates: "Move Sarah to P1" or "Set Marcus as priority 2"
- Category changes: "Move Alex from friends to work"
- Questions: "Who should I reach out to?" or "Tell me about Jeremy"
- Stats queries: "Show me my stats" or "How many work connections do I have?"
- Planning: "I have plans with Lisa on Tuesday"

Always extract names, dates, and relationship information accurately from user inputs.`;
}

/**
 * Ask Gemini AI to generate a response
 */
export async function askGemini(
  userMessage: string,
  connections: Connection[],
  conversationHistory: SilkMessage[] = []
): Promise<string> {
  if (!google) {
    return "Gemini AI is not configured. Please add your Google Generative AI API key to the .env file. In the meantime, I can still help with basic commands.";
  }

  try {
    const systemPrompt = generateSilkSystemPrompt(connections);

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Silk'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}

${conversationContext ? `Recent conversation:\n${conversationContext}\n` : ''}
User: ${userMessage}

Silk:`;

    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: fullPrompt,
      maxTokens: 500,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "Invalid API key. Please check your Google Generative AI API key in the .env file.";
      }
      return `Error: ${error.message}`;
    }
    return "I encountered an error. Please try again.";
  }
}

/**
 * Analyze relationship health and provide insights
 */
export async function analyzeRelationshipHealth(connections: Connection[]): Promise<string> {
  if (!google) {
    return "Gemini AI analysis is not available. Please configure your API key.";
  }

  const connectionData = connections.map(c => ({
    name: c.name,
    relationship: c.relationship,
    priority: c.priority,
    strength: c.strength,
    daysSinceContact: Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24)),
    totalInteractions: c.interactions.length
  }));

  const prompt = `Analyze this social network and provide 3-5 specific, actionable insights about relationship health. Be concise and helpful:

${JSON.stringify(connectionData, null, 2)}

Focus on:
- Who needs attention most urgently
- Overall network health patterns
- Specific recommendations for strengthening connections
- Positive reinforcement for what's going well

Keep it brief and actionable.`;

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      maxTokens: 400,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error('Analysis error:', error);
    return "Error analyzing relationship health. Please try again.";
  }
}

/**
 * Generate personalized reconnection suggestion
 */
export async function generateReconnectionSuggestion(connection: Connection): Promise<string> {
  if (!google) {
    return `Reach out to ${connection.name} - it's been a while!`;
  }

  const daysSinceContact = Math.floor((Date.now() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24));

  const prompt = `Generate a brief (1-2 sentences) personalized suggestion for reconnecting with someone:

Name: ${connection.name}
Relationship: ${connection.relationship}
Days since last contact: ${daysSinceContact}
Notes: ${connection.notes || 'No notes'}
Tags/Interests: ${connection.tags?.join(', ') || 'None'}

Make it specific, warm, and actionable based on their interests.`;

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt,
      maxTokens: 100,
      temperature: 0.8,
    });

    return text;
  } catch (error) {
    console.error('Suggestion error:', error);
    return `Reach out to ${connection.name} - it's been ${daysSinceContact} days!`;
  }
}
