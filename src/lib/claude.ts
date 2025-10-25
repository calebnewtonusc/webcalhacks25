import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('Anthropic API key not found. Claude AI features will be limited.');
}

export const anthropic = apiKey ? new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true // Note: For production, use a backend proxy
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
- Concise and actionable
- Never guilt-inducing, always motivating

## Response Guidelines:
- Keep responses concise (2-3 sentences for simple queries)
- Use emojis sparingly and appropriately
- When logging interactions, confirm what was logged
- When unable to find a person, suggest alternatives
- Provide specific, actionable suggestions
- Format lists clearly with bullet points or numbers

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
 * Call Claude AI to generate a response
 */
export async function askClaude(
  userMessage: string,
  connections: Connection[],
  conversationHistory: SilkMessage[] = []
): Promise<string> {
  if (!anthropic) {
    return "Claude AI is not configured. Please add your Anthropic API key to the .env file. In the meantime, I can still help with basic commands.";
  }

  try {
    const systemPrompt = generateSilkSystemPrompt(connections);

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Claude API error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return "Invalid API key. Please check your Anthropic API key in the .env file.";
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
  if (!anthropic) {
    return "Claude AI analysis is not available. Please configure your API key.";
  }

  const systemPrompt = `You are a relationship health analyst. Analyze the user's social network and provide actionable insights.`;

  const connectionData = connections.map(c => ({
    name: c.name,
    relationship: c.relationship,
    priority: c.priority,
    strength: c.strength,
    daysSinceContact: Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24)),
    totalInteractions: c.interactions.length
  }));

  const userMessage = `Analyze this social network and provide 3-5 specific, actionable insights:\n\n${JSON.stringify(connectionData, null, 2)}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return "Unable to generate analysis.";
  } catch (error) {
    console.error('Analysis error:', error);
    return "Error analyzing relationship health.";
  }
}

/**
 * Generate personalized reconnection suggestions
 */
export async function generateReconnectionSuggestion(connection: Connection): Promise<string> {
  if (!anthropic) {
    return `Reach out to ${connection.name} - it's been a while!`;
  }

  const daysSinceContact = Math.floor((Date.now() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24));

  const systemPrompt = `You are a relationship coach. Generate a warm, specific suggestion for reconnecting with someone.`;

  const userMessage = `Generate a brief (1-2 sentences) personalized suggestion for reconnecting with:
Name: ${connection.name}
Relationship: ${connection.relationship}
Days since last contact: ${daysSinceContact}
Notes: ${connection.notes || 'No notes'}
Tags/Interests: ${connection.tags?.join(', ') || 'None'}

Make it specific, warm, and actionable.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return `Reach out to ${connection.name} - it's been ${daysSinceContact} days!`;
  } catch (error) {
    console.error('Suggestion error:', error);
    return `Consider reaching out to ${connection.name} soon.`;
  }
}
