import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Connection {
  id: string;
  name: string;
  avatar?: string;
  relationship: 'family' | 'friend' | 'work' | 'school' | 'other';
  priority: 'P1' | 'P2' | 'P3';
  strength: 1 | 2 | 3 | 4 | 5; // Calculated based on last contact and priority
  lastContact: Date;
  contactFrequency: number; // days
  phone?: string;
  email?: string;
  notes: string;
  tags: string[];
  interactions: Interaction[];
  position?: { x: number; y: number };
  birthday?: Date;
  funFacts: string[];
  importantDates?: { type: string; date: Date; description: string }[];
  healthScore: number; // For compatibility
  cluster?: string;
  category?: string;
  subcategory?: string;
  communicationStyle?: 'text' | 'call' | 'email' | 'in-person';
  proximity?: 'same-city' | 'long-distance' | 'international';
  energyLevel?: number;
  sharedInterests?: string[];
}

export interface Interaction {
  id: string;
  type: 'call' | 'text' | 'email' | 'meeting' | 'social';
  date: Date;
  notes?: string;
  duration?: number; // minutes
  quality?: number; // 1-10
  topics?: string[];
  mood?: 'great' | 'good' | 'neutral' | 'difficult';
}

// Event system for real-time updates
type ConnectionEvent = 
  | { type: 'CONNECTION_ADDED'; connection: Connection }
  | { type: 'CONNECTION_UPDATED'; id: string; updates: Partial<Connection> }
  | { type: 'CONNECTION_DELETED'; id: string }
  | { type: 'INTERACTION_ADDED'; connectionId: string; interaction: Interaction }
  | { type: 'STRENGTH_UPDATED'; id: string; strength: number };

const connectionEventListeners: ((event: ConnectionEvent) => void)[] = [];

export const subscribeToConnectionEvents = (listener: (event: ConnectionEvent) => void) => {
  connectionEventListeners.push(listener);
  return () => {
    const index = connectionEventListeners.indexOf(listener);
    if (index > -1) connectionEventListeners.splice(index, 1);
  };
};

const emitConnectionEvent = (event: ConnectionEvent) => {
  connectionEventListeners.forEach(listener => listener(event));
};

// Strength calculation - exact linear calculation based on priority and days since contact
export const getStrengthScore = (daysSinceContact: number, priority: 'P1' | 'P2' | 'P3'): 1 | 2 | 3 | 4 | 5 => {
  // New connections start at strength 3
  if (daysSinceContact === 0) return 3;
  
  const thresholds = {
    P1: { 5: 3, 4: 7, 3: 10, 2: 14, 1: 21 }, // Weekly contact goal
    P2: { 5: 7, 4: 14, 3: 21, 2: 28, 1: 35 }, // Bi-weekly contact goal  
    P3: { 5: 15, 4: 30, 3: 45, 2: 60, 1: 90 }  // Monthly contact goal
  };
  
  const threshold = thresholds[priority];
  
  if (daysSinceContact <= threshold[5]) return 5;
  if (daysSinceContact <= threshold[4]) return 4;
  if (daysSinceContact <= threshold[3]) return 3;
  if (daysSinceContact <= threshold[2]) return 2;
  return 1;
};

// Get strength color
export const getStrengthColor = (strength: number): string => {
  const colors = {
    5: '#10b981', // green
    4: '#84cc16', // lime
    3: '#f59e0b', // yellow
    2: '#f97316', // orange
    1: '#ef4444'  // red
  };
  return colors[strength as keyof typeof colors] || colors[1];
};

interface ConnectionContextType {
  connections: Connection[];
  addConnection: (connection: Omit<Connection, 'id' | 'interactions' | 'strength' | 'healthScore'>) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  addInteraction: (connectionId: string, interaction: Omit<Interaction, 'id'>) => void;
  getConnectionById: (id: string) => Connection | undefined;
  updateStrengthScores: () => void;
  initializeFromOnboarding: (onboardingData: any) => void;
  initializeDummyData: () => void;
  getAllInteractions: () => (Interaction & { connectionName: string; connectionId: string })[];
  findConnectionByName: (name: string) => Connection | undefined;
  getConnectionsByRelationship: (relationship: string) => Connection[];
  getConnectionsByPriority: (priority: 'P1' | 'P2' | 'P3') => Connection[];
  getConnectionsByStrength: (strength: number) => Connection[];
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

// Generate comprehensive dummy data (50 people with realistic interactions)
const generateDummyData = (): Connection[] => {
  const names = [
    'Sarah Chen', 'Marcus Johnson', 'Emily Rodriguez', 'David Kim', 'Jessica Taylor',
    'Michael Brown', 'Ashley Davis', 'Ryan Wilson', 'Lauren Martinez', 'Alex Thompson',
    'Samantha Lee', 'Jordan Garcia', 'Taylor Anderson', 'Morgan White', 'Casey Miller',
    'Jamie Parker', 'Avery Jones', 'Riley Cooper', 'Blake Turner', 'Sage Williams',
    'Cameron Smith', 'Quinn Jackson', 'Reese Harris', 'Skylar Clark', 'Rowan Lewis',
    'Phoenix Robinson', 'River Walker', 'Dakota Hall', 'Emery Allen', 'Hayden Young',
    'Kendall King', 'Logan Wright', 'Parker Lopez', 'Peyton Hill', 'Reagan Scott',
    'Remy Green', 'Rory Adams', 'Sawyer Baker', 'Shay Gonzalez', 'Tatum Nelson',
    'Teagan Carter', 'Finley Mitchell', 'Harper Perez', 'Indigo Roberts', 'Kai Turner',
    'Lane Phillips', 'Marlowe Campbell', 'Nova Evans', 'Onyx Edwards', 'Zara Collins',
    'Brooklyn Martinez', 'Sage Thompson', 'River Johnson', 'Aspen Davis', 'Wren Garcia',
    'Atlas Brown', 'Luna Rodriguez', 'Orion Wilson', 'Ivy Chen', 'Felix Anderson',
    'Hazel Kim', 'Jasper Lee', 'Willow Taylor', 'Ezra White', 'Autumn Miller',
    'Silas Parker', 'Iris Jones', 'Milo Cooper', 'Violet Turner', 'Leo Williams',
    'Rose Smith', 'Finn Jackson', 'Lily Harris', 'Owen Clark', 'Ruby Lewis',
    'Theo Robinson', 'Sage Walker', 'Nora Hall', 'Luca Allen', 'Maya Young',
    'Brooklyn Martinez', 'Sage Thompson', 'River Johnson', 'Aspen Davis', 'Wren Garcia',
    'Atlas Brown', 'Luna Rodriguez', 'Orion Wilson', 'Ivy Chen', 'Felix Anderson',
    'Hazel Kim', 'Jasper Lee', 'Willow Taylor', 'Ezra White', 'Autumn Miller',
    'Silas Parker', 'Iris Jones', 'Milo Cooper', 'Violet Turner', 'Leo Williams',
    'Rose Smith', 'Finn Jackson', 'Lily Harris', 'Owen Clark', 'Ruby Lewis',
    'Theo Robinson', 'Sage Walker', 'Nora Hall', 'Luca Allen', 'Maya Young',
    'Eli King', 'Zoe Wright', 'Max Lopez', 'Chloe Hill', 'Sam Scott'
  ];

  console.log('🔥 GENERATING DUMMY DATA with', names.length, 'names');
  console.log('🔥 Names array:', names);

  const relationships: Connection['relationship'][] = ['family', 'friend', 'work', 'school', 'other'];
  const priorities: Connection['priority'][] = ['P1', 'P2', 'P3'];
  
  const interactionNotes = [
    'Had an amazing coffee catch-up, discussed their new job promotion',
    'Quick lunch meeting to talk about the upcoming project deadline',
    'Long phone call about their recent breakup, offered support',
    'Went hiking together at Runyon Canyon, beautiful weather',
    'Birthday dinner celebration at their favorite Italian restaurant',
    'Study session for the upcoming exam, very productive',
    'Movie night watching the new Marvel film, lots of laughs',
    'Deep conversation about life goals and future plans',
    'Helped them move apartments, ordered pizza after',
    'Beach day in Santa Monica, played volleyball',
    'Concert at the Hollywood Bowl, incredible performance',
    'Cooking class together, learned to make pasta from scratch',
    'Game night with board games and wine',
    'Workout session at the gym, pushed each other hard',
    'Art gallery opening in downtown LA, inspiring exhibits',
    'Brunch in West Hollywood, tried the new avocado toast place',
    'Road trip to San Diego for the weekend',
    'Attended their graduation ceremony, so proud',
    'Late night study session at the library',
    'Surprise party planning for mutual friend',
    'Wine tasting in Malibu, discovered new favorites',
    'Rock climbing at the local climbing gym',
    'Farmers market visit, bought fresh produce',
    'Karaoke night, sang our hearts out',
    'Museum visit to LACMA, saw the new contemporary exhibit',
    'Spontaneous road trip to Big Sur, amazing views',
    'Cooked dinner together, tried a new recipe',
    'Attended their art show opening, so talented',
    'Late night philosophical discussion over tea',
    'Helped them practice for job interview',
    'Surprise birthday party planning session',
    'Morning yoga class followed by smoothies',
    'Explored the new farmers market downtown',
    'Binge-watched entire season of our favorite show',
    'Went thrift shopping and found amazing vintage pieces',
    'Attended outdoor concert in Griffith Park',
    'Cooking competition at their place, I won!',
    'Deep dive conversation about career changes',
    'Helped them move into new apartment',
    'Spontaneous beach volleyball game',
    'Attended their graduation ceremony',
    'Late night gaming session, lost track of time',
    'Explored new neighborhood and found great cafe',
    'Attended their poetry reading, very moving',
    'Helped them prepare for big presentation',
    'Spontaneous dance class, so much fun',
    'Attended food truck festival together',
    'Deep conversation about relationships and life',
    'Helped them practice guitar for open mic night',
    'Weekend camping trip in the mountains'
  ];

  const funFactsPool = [
    'Makes the best homemade pizza in LA',
    'Has visited 23 countries and counting',
    'Speaks fluent Mandarin and Spanish',
    'Runs a popular food blog with 50k followers',
    'Can solve a Rubik\'s cube in under 2 minutes',
    'Volunteers at the animal shelter every weekend',
    'Has a black belt in karate',
    'Collects vintage vinyl records from the 70s',
    'Grew up on a farm in Iowa',
    'Was an extra in three Hollywood movies',
    'Makes incredible latte art',
    'Has a pet snake named Slytherin',
    'Can juggle while riding a unicycle',
    'Writes poetry and has been published',
    'Expert rock climber, has climbed El Capitan',
    'Makes handmade jewelry and sells on Etsy',
    'Has perfect pitch and can identify any note',
    'Knows every Disney movie soundtrack by heart',
    'Can do a backflip on a trampoline',
    'Has a photographic memory for faces and names',
    'Builds custom furniture in their garage',
    'Can speak 5 languages fluently',
    'Has run 3 marathons and counting',
    'Makes award-winning sourdough bread',
    'Can identify any bird by its call',
    'Has a collection of over 500 books',
    'Can solve any Sudoku puzzle in minutes',
    'Grows their own vegetables and herbs',
    'Has performed stand-up comedy professionally',
    'Can play 4 musical instruments',
    'Has a pilot license for small aircraft',
    'Makes their own kombucha and kimchi',
    'Can identify constellations without a guide',
    'Has completed 10 escape rooms successfully',
    'Makes handmade candles with unique scents',
    'Can recite pi to 100 decimal places',
    'Has a green thumb and never kills plants',
    'Can solve a crossword puzzle in under 10 minutes',
    'Makes the most amazing homemade ice cream',
    'Can identify any wine region by taste',
    'Has hiked the entire Pacific Crest Trail',
    'Makes custom pottery on a wheel',
    'Can beatbox and freestyle rap',
    'Has a collection of vintage cameras',
    'Can identify any dog breed instantly',
    'Makes their own natural skincare products',
    'Can solve any logic puzzle or riddle',
    'Has performed in community theater productions',
    'Can identify any tree species by its leaves',
    'Professional level chess player'
  ];

  const connections: Connection[] = [];
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const relationship = relationships[Math.floor(Math.random() * relationships.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Generate realistic last contact based on priority and strength
    const targetStrength = Math.floor(Math.random() * 5) + 1;
    let daysSinceContact: number;
    
    // Calculate days since contact to achieve target strength
    const thresholds = {
      P1: { 5: 3, 4: 7, 3: 10, 2: 14, 1: 21 },
      P2: { 5: 7, 4: 14, 3: 21, 2: 28, 1: 35 },
      P3: { 5: 15, 4: 30, 3: 45, 2: 60, 1: 90 }
    };
    
    const threshold = thresholds[priority];
    switch(targetStrength) {
      case 5: daysSinceContact = Math.floor(Math.random() * threshold[5]); break;
      case 4: daysSinceContact = threshold[5] + Math.floor(Math.random() * (threshold[4] - threshold[5])); break;
      case 3: daysSinceContact = threshold[4] + Math.floor(Math.random() * (threshold[3] - threshold[4])); break;
      case 2: daysSinceContact = threshold[3] + Math.floor(Math.random() * (threshold[2] - threshold[3])); break;
      default: daysSinceContact = threshold[2] + Math.floor(Math.random() * (threshold[1] - threshold[2])); break;
    }
    
    const lastContact = new Date();
    lastContact.setDate(lastContact.getDate() - daysSinceContact);
    
    const strength = getStrengthScore(daysSinceContact, priority);

    // Generate realistic interactions over the past few months
    const numInteractions = Math.floor(Math.random() * 15) + 5; // 5-20 interactions
    const interactions: Interaction[] = [];
    
    for (let j = 0; j < numInteractions; j++) {
      const interactionDate = new Date();
      interactionDate.setDate(interactionDate.getDate() - (daysSinceContact + (j * Math.floor(Math.random() * 14))));
      
      interactions.push({
        id: `interaction-${i}-${j}`,
        type: ['call', 'text', 'email', 'meeting', 'social'][Math.floor(Math.random() * 5)] as any,
        date: interactionDate,
        notes: interactionNotes[Math.floor(Math.random() * interactionNotes.length)],
        duration: Math.floor(Math.random() * 120) + 15,
        quality: Math.floor(Math.random() * 3) + 8, // 8-10
        topics: ['work', 'family', 'hobbies', 'travel', 'food', 'movies', 'music'].slice(0, Math.floor(Math.random() * 3) + 1),
        mood: ['great', 'good', 'neutral'][Math.floor(Math.random() * 3)] as any
      });
    }

    // Sort interactions by date (most recent first)
    interactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Generate birthday (random date this year)
    const birthday = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    const connection: Connection = {
      id: `connection-${i}`,
      name,
      relationship,
      priority,
      strength,
      lastContact,
      contactFrequency: priority === 'P1' ? 7 : priority === 'P2' ? 14 : 30,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      notes: `${relationship === 'family' ? 'Family member' : relationship === 'friend' ? 'Great friend' : relationship === 'work' ? 'Work colleague' : relationship === 'school' ? 'School friend' : 'Good person'} I really enjoy spending time with. We have great conversations and always have fun together.`,
      tags: [relationship, priority.toLowerCase(), 'dummy-data'],
      interactions,
      birthday,
      funFacts: funFactsPool.slice(Math.floor(Math.random() * 15), Math.floor(Math.random() * 3) + 2),
      importantDates: [
        {
          type: 'birthday',
          date: birthday,
          description: 'Birthday'
        }
      ],
      healthScore: strength * 20, // Convert 1-5 to 20-100 for compatibility
      cluster: relationship === 'work' ? 'Work Team' : relationship === 'school' ? 'USC Friends' : relationship === 'family' ? 'Family' : 'Social Circle',
      category: relationship === 'work' ? 'Professional' : relationship === 'school' ? 'School' : relationship === 'family' ? 'Family' : 'Social',
      communicationStyle: ['text', 'call', 'email', 'in-person'][Math.floor(Math.random() * 4)] as any,
      proximity: ['same-city', 'long-distance', 'international'][Math.floor(Math.random() * 3)] as any,
      energyLevel: Math.floor(Math.random() * 10) + 1,
      sharedInterests: ['hiking', 'movies', 'cooking', 'travel', 'music', 'art', 'sports', 'reading'].slice(0, Math.floor(Math.random() * 4) + 1)
    };
    
    connections.push(connection);
  }
  
  console.log('Generated', connections.length, 'connections');
  return connections;
};

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    console.log('🔥 CONNECTION CONTEXT USEEFFECT RUNNING');
    // Check if we have onboarding data from session
    const onboardingData = sessionStorage.getItem('onboardingData');
    console.log('🔥 ONBOARDING DATA FROM SESSION:', onboardingData);
    if (onboardingData) {
      try {
        const data = JSON.parse(onboardingData);
        console.log('🔥 PARSED ONBOARDING DATA:', data);
        initializeFromOnboarding(data);
      } catch (error) {
        console.error('Error parsing onboarding data:', error);
        initializeDummyData();
      }
    } else {
      console.log('🔥 NO ONBOARDING DATA - USING DUMMY DATA');
      initializeDummyData();
    }
  }, []);

  const initializeFromOnboarding = (onboardingData: any) => {
    console.log('🔥 INITIALIZING FROM ONBOARDING:', onboardingData);
    const { userProfile, people: allPeople = [] } = onboardingData;
    console.log('🔥 PEOPLE FROM ONBOARDING:', allPeople.length);

    // If no people in onboarding data, use dummy data instead
    if (allPeople.length === 0) {
      console.log('🔥 NO PEOPLE IN ONBOARDING - USING DUMMY DATA');
      initializeDummyData();
      return;
    }

    const connections: Connection[] = allPeople.map((person: any) => {
      const priority = person.priority || 'P3';
      const relationship = person.relationship || 'other';
      
      // Set last contact based on recent interaction data
      const lastContact = new Date();
      let interactions: Interaction[] = [];
      
      if (person.recentInteraction === 'this-week') {
        const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
        lastContact.setDate(lastContact.getDate() - daysAgo);
        interactions = [generateRecentInteraction('this-week', lastContact)];
      } else if (person.recentInteraction === 'this-month') {
        const daysAgo = 7 + Math.floor(Math.random() * 23); // 7-30 days ago
        lastContact.setDate(lastContact.getDate() - daysAgo);
        interactions = [generateRecentInteraction('this-month', lastContact)];
      } else {
        // No recent interaction - set to 30 days ago for strength 3
        lastContact.setDate(lastContact.getDate() - 30);
      }
      
      const daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      const strength = getStrengthScore(daysSinceContact, priority);

      return {
        id: `connection-${Date.now()}-${Math.random()}`,
        name: person.name,
        relationship,
        priority,
        strength,
        lastContact,
        contactFrequency: priority === 'P1' ? 7 : priority === 'P2' ? 14 : 30,
        notes: `Added during onboarding. ${relationship === 'family' ? 'Family member' : relationship === 'friend' ? 'Good friend' : 'Someone important'} in my life.`,
        tags: [relationship, priority.toLowerCase()],
        interactions,
        funFacts: ['Added during setup'],
        importantDates: [],
        healthScore: strength * 20
      };
    });

    // Store user profile in session storage
    if (userProfile) {
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    console.log('Initialized from onboarding:', connections.length, 'connections');
    setConnections(connections);
    // Emit event for real-time updates
    connections.forEach(conn => {
      emitConnectionEvent({ type: 'CONNECTION_ADDED', connection: conn });
    });
  };

  const generateRecentInteraction = (type: 'this-week' | 'this-month', date: Date) => {
    const interactionTypes = ['call', 'text', 'meeting', 'social'];
    const notes = [
      'Great catch-up conversation',
      'Quick check-in call',
      'Coffee meetup',
      'Lunch together',
      'Hung out and had fun'
    ];
    
    return {
      id: `interaction-${Date.now()}-${Math.random()}`,
      type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)] as any,
      date,
      notes: notes[Math.floor(Math.random() * notes.length)],
      quality: Math.floor(Math.random() * 3) + 8 // 8-10
    };
  };

  const initializeDummyData = () => {
    console.log('🔥 INITIALIZING DUMMY DATA - START');
    const dummyData = generateDummyData();
    console.log('🔥 DUMMY DATA GENERATED:', dummyData.length, 'connections');
    console.log('🔥 First 5 connections:', dummyData.slice(0, 5).map(c => c.name));
    setConnections(dummyData);
    console.log('🔥 DUMMY DATA SET IN STATE');
  };

  const updateStrengthScores = () => {
    setConnections(prev => {
      const updated = prev.map(conn => {
        const daysSinceContact = Math.floor((Date.now() - conn.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        const newStrength = getStrengthScore(daysSinceContact, conn.priority);
        return { ...conn, strength: newStrength, healthScore: newStrength * 20 };
      });
      console.log('Updated strength scores for', updated.length, 'connections');
      return updated;
    });
  };

  const addConnection = (connectionData: Omit<Connection, 'id' | 'interactions' | 'strength' | 'healthScore'>) => {
    const daysSinceContact = Math.floor((Date.now() - connectionData.lastContact.getTime()) / (1000 * 60 * 60 * 24));
    const strength = getStrengthScore(daysSinceContact, connectionData.priority);
    
    const newConnection: Connection = {
      ...connectionData,
      id: `connection-${Date.now()}`,
      interactions: [],
      strength,
      healthScore: strength * 20
    };
    setConnections(prev => {
      const updated = [...prev, newConnection];
      console.log('Added connection, total:', updated.length);
      return updated;
    });
    emitConnectionEvent({ type: 'CONNECTION_ADDED', connection: newConnection });
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setConnections(prev => 
      prev.map(conn => {
        if (conn.id === id) {
          const updated = { ...conn, ...updates };
          // Recalculate strength if lastContact or priority changed
          if (updates.lastContact || updates.priority) {
            const daysSinceContact = Math.floor((Date.now() - updated.lastContact.getTime()) / (1000 * 60 * 60 * 24));
            updated.strength = getStrengthScore(daysSinceContact, updated.priority);
            updated.healthScore = updated.strength * 20;
            emitConnectionEvent({ type: 'STRENGTH_UPDATED', id, strength: updated.strength });
          }
          emitConnectionEvent({ type: 'CONNECTION_UPDATED', id, updates: updated });
          return updated;
        }
        return conn;
      })
    );
  };

  const deleteConnection = (id: string) => {
    setConnections(prev => {
      const updated = prev.filter(conn => conn.id !== id);
      console.log('Deleted connection, remaining:', updated.length);
      return updated;
    });
    emitConnectionEvent({ type: 'CONNECTION_DELETED', id });
  };

  const addInteraction = (connectionId: string, interactionData: Omit<Interaction, 'id'>) => {
    const interaction: Interaction = {
      ...interactionData,
      id: `interaction-${Date.now()}`
    };

    setConnections(prev => 
      prev.map(conn => {
        if (conn.id === connectionId) {
          const updatedInteractions = [interaction, ...conn.interactions];
          const daysSinceContact = Math.floor((Date.now() - interaction.date.getTime()) / (1000 * 60 * 60 * 24));
          const strength = getStrengthScore(daysSinceContact, conn.priority);
          
          emitConnectionEvent({ type: 'INTERACTION_ADDED', connectionId, interaction });
          emitConnectionEvent({ type: 'STRENGTH_UPDATED', id: connectionId, strength });
          
          return {
            ...conn,
            interactions: updatedInteractions,
            lastContact: interaction.date,
            strength,
            healthScore: strength * 20
          };
        }
        return conn;
      })
    );
  };

  const getConnectionById = (id: string) => {
    return connections.find(conn => conn.id === id);
  };

  const findConnectionByName = (name: string) => {
    return connections.find(conn => 
      conn.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(conn.name.toLowerCase())
    );
  };

  const getConnectionsByRelationship = (relationship: string) => {
    return connections.filter(conn => conn.relationship === relationship);
  };

  const getConnectionsByPriority = (priority: 'P1' | 'P2' | 'P3') => {
    return connections.filter(conn => conn.priority === priority);
  };

  const getConnectionsByStrength = (strength: number) => {
    return connections.filter(conn => conn.strength === strength);
  };

  const getAllInteractions = () => {
    const allInteractions: (Interaction & { connectionName: string; connectionId: string })[] = [];
    
    connections.forEach(conn => {
      conn.interactions.forEach(interaction => {
        allInteractions.push({
          ...interaction,
          connectionName: conn.name,
          connectionId: conn.id
        });
      });
    });
    
    // Sort by date (most recent first)
    return allInteractions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Log connections count whenever it changes
  useEffect(() => {
    console.log('🔥 CONNECTIONS STATE UPDATED:', connections.length, 'total connections');
    if (connections.length > 0) {
      console.log('🔥 Sample connections:', connections.slice(0, 3).map(c => c.name));
    }
  }, [connections.length]);

  return (
    <ConnectionContext.Provider value={{
      connections,
      addConnection,
      updateConnection,
      deleteConnection,
      addInteraction,
      getConnectionById,
      updateStrengthScores,
      initializeFromOnboarding,
      initializeDummyData,
      getAllInteractions,
      findConnectionByName,
      getConnectionsByRelationship,
      getConnectionsByPriority,
      getConnectionsByStrength
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
}