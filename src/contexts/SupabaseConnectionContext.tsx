import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import type { Database } from '../lib/supabase';

type ConnectionRow = Database['public']['Tables']['connections']['Row'];
type InteractionRow = Database['public']['Tables']['interactions']['Row'];

export interface SupabaseConnection extends Omit<ConnectionRow, 'position_x' | 'position_y' | 'last_contact' | 'created_at' | 'updated_at'> {
  position?: { x: number; y: number };
  lastContact: Date;
  interactions: SupabaseInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupabaseInteraction extends Omit<InteractionRow, 'date' | 'created_at'> {
  date: Date;
  createdAt: Date;
}

interface SupabaseConnectionContextType {
  connections: SupabaseConnection[];
  loading: boolean;
  error: string | null;
  addConnection: (connection: Omit<SupabaseConnection, 'id' | 'interactions' | 'createdAt' | 'updatedAt' | 'user_id'>) => Promise<void>;
  updateConnection: (id: string, updates: Partial<SupabaseConnection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  addInteraction: (connectionId: string, interaction: Omit<SupabaseInteraction, 'id' | 'createdAt' | 'user_id'>) => Promise<void>;
  syncWithLocal: (localConnections: any[]) => Promise<void>;
}

const SupabaseConnectionContext = createContext<SupabaseConnectionContextType | undefined>(undefined);

export function SupabaseConnectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const [connections, setConnections] = useState<SupabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load connections from Supabase
  const loadConnections = async () => {
    if (!user) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (connectionsError) throw connectionsError;

      // Fetch interactions for all connections
      const connectionIds = connectionsData?.map(c => c.id) || [];
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .in('connection_id', connectionIds)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Group interactions by connection
      const interactionsByConnection = (interactionsData || []).reduce((acc, interaction) => {
        if (!acc[interaction.connection_id]) {
          acc[interaction.connection_id] = [];
        }
        acc[interaction.connection_id].push({
          ...interaction,
          date: new Date(interaction.date),
          createdAt: new Date(interaction.created_at)
        });
        return acc;
      }, {} as Record<string, SupabaseInteraction[]>);

      // Transform connections
      const transformedConnections: SupabaseConnection[] = (connectionsData || []).map(conn => ({
        ...conn,
        lastContact: new Date(conn.last_contact),
        position: conn.position_x && conn.position_y ? { x: conn.position_x, y: conn.position_y } : undefined,
        interactions: interactionsByConnection[conn.id] || [],
        createdAt: new Date(conn.created_at),
        updatedAt: new Date(conn.updated_at)
      }));

      setConnections(transformedConnections);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [user]);

  const addConnection = async (connectionData: Omit<SupabaseConnection, 'id' | 'interactions' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          ...connectionData,
          position_x: connectionData.position?.x,
          position_y: connectionData.position?.y,
          last_contact: connectionData.lastContact.toISOString(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newConnection: SupabaseConnection = {
        ...data,
        lastContact: new Date(data.last_contact),
        position: data.position_x && data.position_y ? { x: data.position_x, y: data.position_y } : undefined,
        interactions: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setConnections(prev => [...prev, newConnection]);
    } catch (err) {
      console.error('Error adding connection:', err);
      throw err;
    }
  };

  const updateConnection = async (id: string, updates: Partial<SupabaseConnection>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updateData: any = { ...updates };
      
      // Transform fields for database
      if (updates.position) {
        updateData.position_x = updates.position.x;
        updateData.position_y = updates.position.y;
        delete updateData.position;
      }
      if (updates.lastContact) {
        updateData.last_contact = updates.lastContact.toISOString();
        delete updateData.lastContact;
      }
      
      // Remove fields that shouldn't be updated directly
      delete updateData.interactions;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.user_id;

      const { data, error } = await supabase
        .from('connections')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setConnections(prev => prev.map(conn => 
        conn.id === id 
          ? {
              ...conn,
              ...updates,
              updatedAt: new Date(data.updated_at)
            }
          : conn
      ));
    } catch (err) {
      console.error('Error updating connection:', err);
      throw err;
    }
  };

  const deleteConnection = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Delete interactions first
      await supabase
        .from('interactions')
        .delete()
        .eq('connection_id', id)
        .eq('user_id', user.id);

      // Delete connection
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== id));
    } catch (err) {
      console.error('Error deleting connection:', err);
      throw err;
    }
  };

  const addInteraction = async (connectionId: string, interactionData: Omit<SupabaseInteraction, 'id' | 'createdAt' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          ...interactionData,
          connection_id: connectionId,
          date: interactionData.date.toISOString(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newInteraction: SupabaseInteraction = {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.created_at)
      };

      // Update local state
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? {
              ...conn,
              interactions: [newInteraction, ...conn.interactions],
              lastContact: newInteraction.date,
              health_score: Math.min(100, conn.health_score + 25)
            }
          : conn
      ));

      // Update connection's last contact and health score in database
      await updateConnection(connectionId, {
        lastContact: newInteraction.date,
        health_score: Math.min(100, connections.find(c => c.id === connectionId)?.health_score || 0 + 25)
      });
    } catch (err) {
      console.error('Error adding interaction:', err);
      throw err;
    }
  };

  const syncWithLocal = async (localConnections: any[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      // This would sync local data with Supabase
      // For now, we'll just reload from Supabase
      await loadConnections();
    } catch (err) {
      console.error('Error syncing with local data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupabaseConnectionContext.Provider value={{
      connections,
      loading,
      error,
      addConnection,
      updateConnection,
      deleteConnection,
      addInteraction,
      syncWithLocal
    }}>
      {children}
    </SupabaseConnectionContext.Provider>
  );
}

export function useSupabaseConnections() {
  const context = useContext(SupabaseConnectionContext);
  if (context === undefined) {
    throw new Error('useSupabaseConnections must be used within a SupabaseConnectionProvider');
  }
  return context;
}