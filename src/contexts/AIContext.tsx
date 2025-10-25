import React, { createContext, useContext, useState } from 'react';
import { useConnections } from './ConnectionContext';

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIContextType {
  messages: AIMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (message: string) => void;
  getSuggestions: () => string[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your personal connection assistant. I can help you strengthen your relationships by suggesting who to reach out to, planning hangouts, and keeping track of your social goals. What would you like to work on today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const { connections } = useConnections();

  const sendMessage = (message: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message, connections);
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const getSuggestions = () => {
    const lowHealthConnections = connections
      .filter(conn => conn.healthScore < 50)
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 3);

    return lowHealthConnections.map(conn => 
      `Reach out to ${conn.name} (${conn.healthScore}% health)`
    );
  };

  return (
    <AIContext.Provider value={{
      messages,
      isOpen,
      setIsOpen,
      sendMessage,
      getSuggestions
    }}>
      {children}
    </AIContext.Provider>
  );
}

function generateAIResponse(message: string, connections: any[]): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('suggest')) {
    const lowHealthConnections = connections
      .filter(conn => conn.healthScore < 60)
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 3);

    if (lowHealthConnections.length > 0) {
      return `I notice ${lowHealthConnections.map(c => c.name).join(', ')} could use some attention. ${lowHealthConnections[0].name} has a ${lowHealthConnections[0].healthScore}% health score - maybe send them a quick text or plan a coffee catch-up?`;
    }
    return "Your connections look healthy! Consider reaching out to someone you haven't talked to in a while to strengthen those bonds.";
  }

  if (lowerMessage.includes('plan') || lowerMessage.includes('hangout')) {
    const friends = connections.filter(conn => conn.relationship === 'friend');
    if (friends.length > 0) {
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      return `How about planning something with ${randomFriend.name}? Based on your history, you could try a coffee meetup or a fun activity together.`;
    }
  }

  if (lowerMessage.includes('goal')) {
    return "Great question! I can help you set relationship goals like 'reach out to 3 people this week' or 'plan monthly dinners with close friends'. What kind of social goal interests you?";
  }

  // Default responses
  const responses = [
    "That's interesting! How can I help you strengthen your connections today?",
    "I'm here to help you build stronger relationships. What would you like to focus on?",
    "Let me analyze your connection web and suggest some actions you could take.",
    "Building meaningful relationships takes intention. What's on your mind?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}