import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnections } from './ConnectionContext';
import { subscribeToConnectionEvents } from './ConnectionContext';
import { askGemini, type SilkMessage as GeminiMessage } from '../lib/gemini';

interface SilkMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  actionItems?: string[];
}

interface SilkMemory {
  id: string;
  connectionId: string;
  type: 'conversation' | 'interest' | 'life_event' | 'preference' | 'goal' | 'pattern';
  content: string;
  timestamp: Date;
  importance: number;
  tags: string[];
  context?: string;
}

interface UserPattern {
  id: string;
  type: string;
  description: string;
  confidence: number;
}

interface SilkContextType {
  messages: SilkMessage[];
  memories: SilkMemory[];
  userPatterns: UserPattern[];
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  sendMessage: (message: string) => void;
  processVoiceCommand: (command: string) => void;
  processNaturalLanguageAdd: (input: string) => any;
  getSuggestions: () => string[];
  getConnectionMemories: (connectionId: string) => SilkMemory[];
  addMemory: (memory: Omit<SilkMemory, 'id' | 'timestamp'>) => void;
}

const SilkContext = createContext<SilkContextType | undefined>(undefined);

export function SilkProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SilkMessage[]>([]);
  const { 
    connections, 
    addConnection, 
    updateConnection, 
    addInteraction,
    findConnectionByName,
    getConnectionsByRelationship,
    getConnectionsByPriority,
    getConnectionsByStrength
  } = useConnections();
  const [memories, setMemories] = useState<SilkMemory[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserPattern[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const initialMessage: SilkMessage = {
      id: '1',
      content: "Hi! I'm Silk, your intelligent relationship assistant. I can help you:\n\n• Log interactions and hangouts\n• Update connection information\n• Answer questions about your network\n• Analyze relationship patterns\n\nTry saying things like:\n- \"I hung out with Sarah yesterday\"\n- \"Who haven't I talked to in a while?\"\n- \"Move Marcus to P1 priority\"\n- \"Show me my work connections\"\n- \"Tell me about Jeremy\"",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);

    // Initialize some sample patterns
    setUserPatterns([
      {
        id: '1',
        type: 'communication_preference',
        description: 'Prefers texting over calling for casual check-ins',
        confidence: 0.8
      },
      {
        id: '2',
        type: 'social_pattern',
        description: 'Most active socially on weekends',
        confidence: 0.7
      }
    ]);

    // Subscribe to connection events for real-time updates
    const unsubscribe = subscribeToConnectionEvents((event) => {
      // Add memory when connections are updated
      if (event.type === 'INTERACTION_ADDED') {
        const connection = connections.find(c => c.id === event.connectionId);
        if (connection && event.interaction.notes) {
          addMemory({
            connectionId: event.connectionId,
            type: 'conversation',
            content: event.interaction.notes,
            importance: 7,
            tags: [event.interaction.type, 'auto-logged']
          });
        }
      }
    });

    return unsubscribe;
  }, []);

  const sendMessage = async (message: string) => {
    const userMessage: SilkMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // First try to handle with Gemini AI
      const conversationHistory: GeminiMessage[] = messages.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Process with Gemini for intelligent responses
      const geminiResponse = await askGemini(message, connections, conversationHistory);

      // Check if the message requires action (adding, updating, logging)
      const lowerMessage = message.toLowerCase();
      let actionTaken = false;
      let actionResponse = '';

      // Handle adding people via Silk
      if (lowerMessage.includes('add') && (lowerMessage.includes('to my web') || lowerMessage.includes('to web') || lowerMessage.includes('my web') || lowerMessage.includes('friend') || lowerMessage.includes('colleague') || lowerMessage.includes('family'))) {
        const result = parseNaturalLanguageAdd(message, addConnection, addInteraction);

        addConnection({
          name: result.name,
          relationship: result.relationship,
          priority: result.priority,
          phone: result.phone,
          email: result.email,
          notes: result.notes,
          tags: result.tags,
          contactFrequency: result.contactFrequency,
          cluster: result.cluster,
          lastContact: result.lastContact,
          funFacts: [],
          importantDates: []
        });

        if (result.hadInteraction) {
          setTimeout(() => {
            const newConnection = connections.find(c => c.name.toLowerCase() === result.name.toLowerCase());
            if (newConnection) {
              addInteraction(newConnection.id, {
                type: 'social',
                date: result.lastContact,
                notes: result.interactionNotes,
                quality: 8
              });
            }
          }, 100);
        }

        actionTaken = true;
        actionResponse = `✅ Added ${result.name} to your WEB!`;
      }

      // Handle logging interactions
      else if (lowerMessage.includes('hung out') || lowerMessage.includes('saw') ||
          lowerMessage.includes('met with') || lowerMessage.includes('had coffee') ||
          lowerMessage.includes('had lunch') || lowerMessage.includes('dinner with') ||
          lowerMessage.includes('called')) {
        const nameMatch = message.match(/(?:hung out with|saw|met with|had coffee with|had lunch with|dinner with|called|went to.*with)\s+([a-zA-Z\s]+?)(?:\s+yesterday|\s+today|\s+this week|\s+sometime|\s+and|\s*$)/i);

        if (nameMatch) {
          const name = nameMatch[1].trim();
          const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));

          if (connection) {
            let interactionDate = new Date();
            if (lowerMessage.includes('yesterday')) {
              interactionDate.setDate(interactionDate.getDate() - 1);
            }

            let interactionType: 'call' | 'text' | 'email' | 'meeting' | 'social' = 'social';
            if (lowerMessage.includes('called')) interactionType = 'call';
            else if (lowerMessage.includes('coffee') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) interactionType = 'meeting';

            addInteraction(connection.id, {
              type: interactionType,
              date: interactionDate,
              notes: `Logged via Silk: "${message}"`,
              quality: 8
            });

            actionTaken = true;
            actionResponse = `✅ Logged your interaction with ${connection.name}!`;
          }
        }
      }

      // Handle priority updates
      else if ((lowerMessage.includes('move') || lowerMessage.includes('set') || lowerMessage.includes('change')) &&
          (lowerMessage.includes('p1') || lowerMessage.includes('p2') || lowerMessage.includes('p3') || lowerMessage.includes('priority'))) {
        const nameMatch = message.match(/(move|set|change)\s+([a-zA-Z\s]+?)\s+(?:to\s+)?p?([123])/i);
        const priorityMatch = message.match(/p([123])/i);

        if (nameMatch && priorityMatch) {
          const name = nameMatch[2].trim();
          const priority = `P${priorityMatch[1]}` as 'P1' | 'P2' | 'P3';
          const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));

          if (connection) {
            updateConnection(connection.id, { priority });
            actionTaken = true;
            actionResponse = `✅ Updated ${connection.name} to ${priority} priority!`;
          }
        }
      }

      // Use Gemini's response combined with action feedback
      const finalResponse = actionTaken ? `${actionResponse}\n\n${geminiResponse}` : geminiResponse;

      const silkMessage: SilkMessage = {
        id: (Date.now() + 1).toString(),
        content: finalResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, silkMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback to original logic if Claude fails
      const fallbackResponse = generateSilkResponse(message, connections, addConnection, updateConnection, addInteraction);
      const silkMessage: SilkMessage = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, silkMessage]);
    }
  };

  const processVoiceCommand = (command: string) => {
    sendMessage(command);
  };

  const processNaturalLanguageAdd = (input: string) => {
    const result = parseNaturalLanguageAdd(input, addConnection, addInteraction);
    return result;
  };

  const getSuggestions = () => {
    return [
      "Reach out to someone you haven't talked to in a while",
      "Plan a group hangout this weekend",
      "Check in with your P1 priority connections"
    ];
  };

  const getConnectionMemories = (connectionId: string) => {
    return memories.filter(memory => memory.connectionId === connectionId);
  };

  const addMemory = (memoryData: Omit<SilkMemory, 'id' | 'timestamp'>) => {
    const newMemory: SilkMemory = {
      ...memoryData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMemories(prev => [...prev, newMemory]);
  };

  return (
    <SilkContext.Provider value={{
      messages,
      memories,
      userPatterns,
      isListening,
      setIsListening,
      sendMessage,
      processVoiceCommand,
      processNaturalLanguageAdd,
      getSuggestions,
      getConnectionMemories,
      addMemory
    }}>
      {children}
    </SilkContext.Provider>
  );
}

function parseNaturalLanguageAdd(input: string, addConnection: any, addInteraction: any) {
  const lowerInput = input.toLowerCase();
  
  // Extract name (required)
  let name = '';
  const namePatterns = [
    /add (?:my )?(?:friend |colleague |family member |mentor )?([a-zA-Z\s]+?)(?:\s+from|\s+to|\s*,|$)/i,
    /([a-zA-Z\s]+?)(?:\s+from|\s+to|\s*,|$)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }
  
  if (!name) {
    name = 'New Contact';
  }

  // Extract relationship
  let relationship: 'family' | 'friend' | 'work' | 'school' | 'other' = 'friend';
  if (lowerInput.includes('family') || lowerInput.includes('sister') || lowerInput.includes('brother') || lowerInput.includes('mom') || lowerInput.includes('dad')) {
    relationship = 'family';
  } else if (lowerInput.includes('colleague') || lowerInput.includes('coworker') || lowerInput.includes('work')) {
    relationship = 'work';
  } else if (lowerInput.includes('school') || lowerInput.includes('college') || lowerInput.includes('university')) {
    relationship = 'school';
  }

  // Extract priority
  let priority: 'P1' | 'P2' | 'P3' = 'P3';
  if (lowerInput.includes('priority 1') || lowerInput.includes('p1')) {
    priority = 'P1';
  } else if (lowerInput.includes('priority 2') || lowerInput.includes('p2')) {
    priority = 'P2';
  }

  // Extract phone
  const phoneMatch = input.match(/(?:phone|number|call).*?(\+?[\d\s\-\(\)]{10,})/i);
  const phone = phoneMatch ? phoneMatch[1].trim() : '';

  // Extract email
  const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  // Extract location/hometown
  const locationMatch = input.match(/(?:from|hometown|lives in|based in)\s+([a-zA-Z\s]+?)(?:\s+and|\s*,|$)/i);
  const location = locationMatch ? locationMatch[1].trim() : '';

  // Extract interests
  const interestMatch = input.match(/(?:likes|enjoys|into)\s+([a-zA-Z\s]+?)(?:\s+and|\s*,|\.|$)/i);
  const interests = interestMatch ? [interestMatch[1].trim()] : [];

  // Check for recent interaction
  const hadInteraction = lowerInput.includes('hung out') || lowerInput.includes('met') || lowerInput.includes('saw') || lowerInput.includes('today') || lowerInput.includes('yesterday');
  
  let lastContact = new Date();
  let interactionNotes = '';
  
  if (hadInteraction) {
    if (lowerInput.includes('yesterday')) {
      lastContact = new Date();
      lastContact.setDate(lastContact.getDate() - 1);
    }
    interactionNotes = `Added via natural language: "${input}"`;
  } else {
    // No interaction yet, set to a few days ago to start at strength 4
    lastContact = new Date();
    lastContact.setDate(lastContact.getDate() - 1);
  }

  // Build notes
  let notes = `Added via natural language processing.`;
  if (location) notes += ` From ${location}.`;
  if (interests.length > 0) notes += ` Interests: ${interests.join(', ')}.`;
  
  // Extract cluster/group
  let cluster = '';
  if (lowerInput.includes('school') || lowerInput.includes('college') || lowerInput.includes('university')) {
    cluster = 'School';
  } else if (lowerInput.includes('work') || lowerInput.includes('office')) {
    cluster = 'Work';
  } else if (relationship === 'family') {
    cluster = 'Family';
  } else {
    cluster = 'Social';
  }

  return {
    name,
    relationship,
    priority,
    phone,
    email,
    notes,
    tags: interests,
    contactFrequency: priority === 'P1' ? 7 : priority === 'P2' ? 14 : 30,
    cluster,
    lastContact,
    hadInteraction,
    interactionNotes
  };
}

function generateSilkResponse(message: string, connections: any[], addConnection: any, updateConnection: any, addInteraction: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Handle adding people via Silk
  if (lowerMessage.includes('add') && (lowerMessage.includes('to my web') || lowerMessage.includes('to web') || lowerMessage.includes('my web') || lowerMessage.includes('friend') || lowerMessage.includes('colleague') || lowerMessage.includes('family'))) {
    try {
      const result = parseNaturalLanguageAdd(message, addConnection, addInteraction);
      
      // Add the connection
      addConnection({
        name: result.name,
        relationship: result.relationship,
        priority: result.priority,
        phone: result.phone,
        email: result.email,
        notes: result.notes,
        tags: result.tags,
        contactFrequency: result.contactFrequency,
        cluster: result.cluster,
        lastContact: result.lastContact,
        funFacts: [],
        importantDates: []
      });
      
      // Add interaction if they hung out
      if (result.hadInteraction) {
        // We'll need to get the connection ID after it's created
        setTimeout(() => {
          const newConnection = connections.find(c => c.name.toLowerCase() === result.name.toLowerCase());
          if (newConnection) {
            addInteraction(newConnection.id, {
              type: 'social',
              date: result.lastContact,
              notes: result.interactionNotes,
              quality: 8
            });
          }
        }, 100);
      }
      
      return `✅ Added ${result.name} to your WEB! They've been set as ${result.relationship} with ${result.priority} priority. ${result.hadInteraction ? 'I also logged your recent interaction.' : ''} You can find them in your Web view now.`;
    } catch (error) {
      return `I had trouble parsing that. Try something like: "Add my friend Sarah to my web, priority 1" or use the Add Contact page for more complex entries.`;
    }
  }
  
  // Enhanced moving people between categories
  if (lowerMessage.includes('move') && (lowerMessage.includes('from') || lowerMessage.includes('to'))) {
    // Pattern: "move [name] from [category] to [category]"
    const fullMoveMatch = message.match(/move\s+([a-zA-Z\s]+?)\s+from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s|$)/i);
    // Pattern: "move [name] to [category]"
    const simpleMoveMatch = message.match(/move\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s|$)/i);
    
    let name, toCategory;
    
    if (fullMoveMatch) {
      name = fullMoveMatch[1].trim();
      toCategory = fullMoveMatch[3].trim().toLowerCase();
    } else if (simpleMoveMatch) {
      name = simpleMoveMatch[1].trim();
      toCategory = simpleMoveMatch[2].trim().toLowerCase();
    }
    
    if (name && toCategory) {
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        let newRelationship = connection.relationship;
        if (toCategory.includes('work') || toCategory.includes('colleague')) {
          newRelationship = 'work';
        } else if (toCategory.includes('friend')) {
          newRelationship = 'friend';
        } else if (toCategory.includes('family')) {
          newRelationship = 'family';
        } else if (toCategory.includes('school')) {
          newRelationship = 'school';
        } else if (toCategory.includes('other')) {
          newRelationship = 'other';
        } else if (toCategory.includes('school')) {
          newRelationship = 'school';
        }
        
        updateConnection(connection.id, { relationship: newRelationship });
        return `✅ Moved ${connection.name} to ${newRelationship} category! You can see this change in your Web view.`;
      } else {
        return `I couldn't find someone named "${name}" in your connections. Try checking the exact name.`;
      }
    }
  }
  
  // Handle priority updates
  if ((lowerMessage.includes('move') || lowerMessage.includes('set') || lowerMessage.includes('change')) && 
      (lowerMessage.includes('p1') || lowerMessage.includes('p2') || lowerMessage.includes('p3') || lowerMessage.includes('priority'))) {
    const nameMatch = message.match(/(move|set|change)\s+([a-zA-Z\s]+?)\s+(?:to\s+)?p?([123])/i) ||
                     message.match(/([a-zA-Z\s]+?)\s+(?:to\s+)?p([123])/i);
    const priorityMatch = message.match(/p([123])/i);
    
    if (nameMatch && priorityMatch) {
      const name = (nameMatch[2] || nameMatch[1]).trim();
      const priority = `P${priorityMatch[1]}` as 'P1' | 'P2' | 'P3';
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        updateConnection(connection.id, { priority });
        return `✅ Moved ${connection.name} to ${priority} priority! This means you'll aim to contact them ${priority === 'P1' ? 'weekly' : priority === 'P2' ? 'bi-weekly' : 'monthly'}.`;
      } else {
        return `I couldn't find someone named "${name}" in your connections. Try checking the exact name or add them first.`;
      }
    }
  }
  
  // Enhanced planned interactions
  if (lowerMessage.includes('planned') || lowerMessage.includes('plan to') || lowerMessage.includes('planning to') || 
      lowerMessage.includes('have plans') || lowerMessage.includes('hangout') && (lowerMessage.includes('planned') || lowerMessage.includes('tuesday') || lowerMessage.includes('monday') || lowerMessage.includes('wednesday'))) {
    const nameMatch = message.match(/(?:with|see)\s+([a-zA-Z\s]+?)(?:\s+planned|\s+on|\s+for|\s+this|\s+next|\s+tomorrow|\s+today|\s+tuesday|\s+monday|\s+wednesday|\s+thursday|\s+friday|\s+saturday|\s+sunday|$)/i) ||
                     message.match(/([a-zA-Z\s]+?)\s+(?:planned|on|for)\s+(?:tuesday|monday|wednesday|thursday|friday|saturday|sunday)/i);
    const timeMatch = message.match(/(today|tomorrow|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const timeframe = timeMatch ? timeMatch[1] : 'soon';
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        return `✅ Great! I've noted that you have plans with ${connection.name} ${timeframe}. When you hang out, just tell me "I hung out with ${connection.name}" and I'll log it for you!`;
      } else {
        return `I couldn't find someone named "${name}" in your connections. Would you like me to add them to your WEB first?`;
      }
    }
    
    return `✅ I understand you have plans! Can you tell me who you're planning to see? For example: "I have plans with Sarah on Tuesday"`;
  }
  
  // Enhanced hangout/interaction logging
  if (lowerMessage.includes('hung out') || lowerMessage.includes('hangout') || lowerMessage.includes('saw') || 
      lowerMessage.includes('met with') || lowerMessage.includes('had coffee') || lowerMessage.includes('had lunch') ||
      lowerMessage.includes('went to') || lowerMessage.includes('dinner with') || lowerMessage.includes('called')) {
    const nameMatch = message.match(/(?:hung out with|saw|met with|had coffee with|had lunch with|dinner with|called|went to.*with)\s+([a-zA-Z\s]+?)(?:\s+yesterday|\s+today|\s+this week|\s+sometime|\s+and|\s*$)/i) ||
                     message.match(/([a-zA-Z\s]+?)\s+(?:and I|and me)\s+(?:hung out|went|had)/i);
    
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        let interactionDate = new Date();
        if (lowerMessage.includes('yesterday')) {
          interactionDate.setDate(interactionDate.getDate() - 1);
        } else if (lowerMessage.includes('this week') || lowerMessage.includes('sometime')) {
          // Random day this week
          interactionDate.setDate(interactionDate.getDate() - Math.floor(Math.random() * 7));
        }
        
        // Determine interaction type
        let interactionType: 'call' | 'text' | 'email' | 'meeting' | 'social' = 'social';
        if (lowerMessage.includes('called') || lowerMessage.includes('phone')) interactionType = 'call';
        else if (lowerMessage.includes('coffee') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) interactionType = 'meeting';
        
        addInteraction(connection.id, {
          type: interactionType,
          date: interactionDate,
          notes: `Logged via Silk: "${message}"`,
          quality: 8
        });
        
        return `✅ Logged your hangout with ${connection.name}! Their relationship strength has been updated. You can see this in their profile and your interaction timeline.`;
      } else {
        return `I couldn't find someone named "${name}" in your connections. Would you like me to add them to your WEB first?`;
      }
    }
    
    // Try to extract name from more complex sentences
    const complexNameMatch = message.match(/(?:hung out|saw|met|called)\s+(?:with\s+)?([a-zA-Z\s]+?)(?:\s+and|\s+yesterday|\s+today|\s+this week|\s*$)/i);
    if (complexNameMatch) {
      const name = complexNameMatch[1].trim();
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        let interactionDate = new Date();
        if (lowerMessage.includes('yesterday')) {
          interactionDate.setDate(interactionDate.getDate() - 1);
        } else if (lowerMessage.includes('this week') || lowerMessage.includes('sometime')) {
          interactionDate.setDate(interactionDate.getDate() - Math.floor(Math.random() * 7));
        }
        
        addInteraction(connection.id, {
          type: 'social',
          date: interactionDate,
          notes: `Logged via Silk: "${message}"`,
          quality: 8
        });
        
        return `✅ Logged your interaction with ${connection.name}! Their relationship strength has been updated.`;
      }
    }
    
    return `I understand you had an interaction! Can you tell me who you hung out with? For example: "I hung out with Sarah yesterday"`;
  }

  // Handle questions about connections
  if ((lowerMessage.includes('who') && (lowerMessage.includes('haven\'t talked') || lowerMessage.includes('longest') || lowerMessage.includes('should i reach out'))) ||
      lowerMessage.includes('who should i contact') || lowerMessage.includes('who needs attention')) {
    const lowStrengthPeople = connections.filter(c => c.strength <= 2).slice(0, 5);
    const overdueP1 = connections.filter(c => c.priority === 'P1' && 
      Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24)) > 7);
    
    if (lowStrengthPeople.length > 0 || overdueP1.length > 0) {
      let response = "Here are some people you should reach out to:\n\n";
      
      if (overdueP1.length > 0) {
        response += "🔴 **Overdue P1 contacts:**\n";
        overdueP1.slice(0, 3).forEach(c => {
          const days = Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24));
          response += `• ${c.name} (${days} days ago)\n`;
        });
        response += "\n";
      }
      
      if (lowStrengthPeople.length > 0) {
        response += "⭐ **Low strength connections:**\n";
        lowStrengthPeople.forEach(c => {
          response += `• ${c.name} (${c.strength}⭐)\n`;
        });
      }
      
      return response;
    }
    
    return `Great news! Your connections are in good shape. Your P1 priority people should be contacted weekly, P2 bi-weekly, and P3 monthly. Keep up the good work!`;
  }

  // Enhanced show specific people based on criteria
  if (lowerMessage.includes('show me') || lowerMessage.includes('who are')) {
    if (lowerMessage.includes('low') && lowerMessage.includes('strength')) {
      const lowStrengthPeople = connections.filter(c => c.strength <= 2);
      if (lowStrengthPeople.length > 0) {
        return `Here are your connections with low strength (1-2 stars): ${lowStrengthPeople.map(c => `${c.name} (${c.strength}⭐)`).join(', ')}. Consider reaching out to strengthen these relationships!`;
      }
      return `Great news! All your connections have decent strength scores (3+ stars). Keep up the good work!`;
    }
    
    // Handle relationship filtering
    const relationshipTypes = ['work', 'family', 'friend', 'school', 'other'];
    const matchedType = relationshipTypes.find(type => lowerMessage.includes(type));
    
    if (matchedType) {
      const filteredConnections = connections.filter(c => c.relationship === matchedType);
      if (filteredConnections.length > 0) {
        return `Your ${matchedType} connections: ${filteredConnections.map(c => `${c.name} (${c.strength}⭐, ${c.priority})`).join(', ')}. You have ${filteredConnections.length} ${matchedType} connections total.`;
      }
      return `You don't have any ${matchedType} connections in your WEB yet. Would you like to add some?`;
    }
    
    // Handle priority filtering
    if (lowerMessage.includes('p1') || lowerMessage.includes('priority 1')) {
      const p1Connections = connections.filter(c => c.priority === 'P1');
      return `Your P1 (weekly contact) connections: ${p1Connections.map(c => `${c.name} (${c.strength}⭐)`).join(', ')}. You have ${p1Connections.length} P1 connections.`;
    }
    if (lowerMessage.includes('p2') || lowerMessage.includes('priority 2')) {
      const p2Connections = connections.filter(c => c.priority === 'P2');
      return `Your P2 (bi-weekly contact) connections: ${p2Connections.map(c => `${c.name} (${c.strength}⭐)`).join(', ')}. You have ${p2Connections.length} P2 connections.`;
    }
    if (lowerMessage.includes('p3') || lowerMessage.includes('priority 3')) {
      const p3Connections = connections.filter(c => c.priority === 'P3');
      return `Your P3 (monthly contact) connections: ${p3Connections.map(c => `${c.name} (${c.strength}⭐)`).join(', ')}. You have ${p3Connections.length} P3 connections.`;
    }
  }

  // Enhanced "tell me about" functionality
  if (lowerMessage.includes('tell me about') || lowerMessage.includes('info about') || lowerMessage.includes('details about')) {
    const nameMatch = message.match(/(?:tell me about|info about|details about)\s+([a-zA-Z\s]+)/i);
    if (lowStrengthPeople.length > 0) {
      return `Here are your connections with low strength (1-2 stars): ${lowStrengthPeople.map(c => `${c.name} (${c.strength}⭐)`).join(', ')}. Consider reaching out to strengthen these relationships!`;
    }
    return `Great news! All your connections have decent strength scores (3+ stars). Keep up the good work!`;
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const connection = connections.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
      
      if (connection) {
        const daysSinceContact = Math.floor((Date.now() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        let response = `Here's what I know about ${connection.name}:\n\n`;
        response += `• **Relationship:** ${connection.relationship}\n`;
        response += `• **Priority:** ${connection.priority} (${connection.priority === 'P1' ? 'weekly' : connection.priority === 'P2' ? 'bi-weekly' : 'monthly'} contact)\n`;
        response += `• **Strength:** ${connection.strength}⭐\n`;
        response += `• **Last contact:** ${daysSinceContact === 0 ? 'today' : `${daysSinceContact} days ago`}\n`;
        response += `• **Total interactions:** ${connection.interactions.length}\n`;
        if (connection.phone) response += `• **Phone:** ${connection.phone}\n`;
        if (connection.email) response += `• **Email:** ${connection.email}\n`;
        if (connection.tags.length > 0) response += `• **Tags:** ${connection.tags.join(', ')}\n`;
        response += `\n${connection.notes || 'No notes yet - you can add some in their profile!'}`;
        return response;
      } else {
        return `I couldn't find someone named "${name}" in your connections. Try checking the exact name or browse your Web view to see all your connections.`;
      }
    }
    return `I can provide insights about your connections! Tell me a specific person's name, like "Tell me about Sarah" and I'll share what I know about them.`;
  }

  // Enhanced stats functionality
  if (lowerMessage.includes('stats') || lowerMessage.includes('how many')) {
    const totalConnections = connections.length;
    const avgStrength = connections.length > 0 ? (connections.reduce((sum, c) => sum + c.strength, 0) / connections.length).toFixed(1) : 0;
    const strongConnections = connections.filter(c => c.strength >= 4).length;
    const needsAttention = connections.filter(c => c.strength <= 2).length;
    const p1Count = connections.filter(c => c.priority === 'P1').length;
    const p2Count = connections.filter(c => c.priority === 'P2').length;
    const p3Count = connections.filter(c => c.priority === 'P3').length;
    
    return `📊 Your WEB Stats:\n\n• **Total connections:** ${totalConnections}\n• **Average strength:** ${avgStrength}⭐\n• **Strong relationships (4-5⭐):** ${strongConnections}\n• **Need attention (1-2⭐):** ${needsAttention}\n• **Priority breakdown:** P1: ${p1Count}, P2: ${p2Count}, P3: ${p3Count}\n\nYou can see more detailed stats on your Profile page!`;
  }

  // Default responses
  const responses = [
    "I can help you with many things! Try:\n• **'I hung out with [name] yesterday'**\n• **'Who haven't I talked to in a while?'**\n• **'Move [name] to work category'**\n• **'Show me my P1 connections'**\n• **'Tell me about [name]'**\n\nI'm constantly learning about your relationships!",
    "I'm here to help manage your relationships intelligently! You can:\n• **Log interactions** naturally\n• **Move people** between categories\n• **Get insights** about your network\n• **Plan hangouts** and track them",
    "What would you like to know about your connections? I can:\n• **Identify people** to reach out to\n• **Show relationship patterns**\n• **Update priorities** and categories\n• **Track interaction history**",
    "I understand natural language perfectly! Try:\n• **'Set Marcus to P1 priority'**\n• **'I have plans with Sarah on Tuesday'**\n• **'Show me my work connections with low strength'**\n• **'Who needs attention this week?'**"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

export function useSilk() {
  const context = useContext(SilkContext);
  if (context === undefined) {
    throw new Error('useSilk must be used within a SilkProvider');
  }
  return context;
}