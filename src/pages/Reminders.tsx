import React, { useState } from 'react';
import { Bell, Clock, CheckCircle, AlertTriangle, Calendar, Brain, Zap, Filter } from 'lucide-react';
import { useConnections } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSilk } from '../contexts/SilkContext';

interface Reminder {
  id: string;
  connectionId: string;
  connectionName: string;
  type: 'overdue' | 'due_soon' | 'scheduled' | 'silk_suggestion';
  message: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  silkReason?: string;
  actionSuggestion?: string;
}

const Reminders = () => {
  const { connections } = useConnections();
  const { currentTheme } = useTheme();
  const { memories, userPatterns, getSuggestions } = useSilk();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'silk'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Generate intelligent reminders using Silk's analysis
  const generateReminders = (): Reminder[] => {
    const reminders: Reminder[] = [];
    const now = new Date();
    const silkSuggestions = getSuggestions();

    // Traditional health-based reminders
    connections.forEach(connection => {
      const daysSinceContact = Math.floor(
        (now.getTime() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const isOverdue = daysSinceContact > connection.contactFrequency;
      const isDueSoon = daysSinceContact >= connection.contactFrequency - 2;
      
      // Get connection memories for context
      const connectionMemories = memories.filter(m => m.connectionId === connection.id);
      const lastMemory = connectionMemories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      if (isOverdue) {
        let message = `You haven't contacted ${connection.name} in ${daysSinceContact} days.`;
        let actionSuggestion = 'Send a quick text';
        
        // Add context from memories
        if (lastMemory) {
          if (lastMemory.type === 'life_event') {
            message += ` Last time you talked about: ${lastMemory.content}`;
            actionSuggestion = 'Follow up on their situation';
          } else if (lastMemory.type === 'interest') {
            actionSuggestion = `Talk about ${lastMemory.tags[0]}`;
          }
        }
        
        // Adjust based on communication style
        if (connection.communicationStyle === 'call') {
          actionSuggestion = 'Give them a call';
        } else if (connection.communicationStyle === 'email') {
          actionSuggestion = 'Send a thoughtful email';
        }
        
        reminders.push({
          id: `overdue-${connection.id}`,
          connectionId: connection.id,
          connectionName: connection.name,
          type: 'overdue',
          message,
          dueDate: new Date(connection.lastContact.getTime() + connection.contactFrequency * 24 * 60 * 60 * 1000),
          priority: connection.healthScore < 30 ? 'high' : connection.healthScore < 60 ? 'medium' : 'low',
          actionSuggestion
        });
      } else if (isDueSoon) {
        const daysUntilDue = connection.contactFrequency - daysSinceContact;
        reminders.push({
          id: `due-soon-${connection.id}`,
          connectionId: connection.id,
          connectionName: connection.name,
          type: 'due_soon',
          message: `Time to reach out to ${connection.name} in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          dueDate: new Date(connection.lastContact.getTime() + connection.contactFrequency * 24 * 60 * 60 * 1000),
          priority: 'low',
          actionSuggestion: 'Plan something fun'
        });
      }
    });

    // Add Silk's intelligent suggestions
    silkSuggestions.forEach((suggestion, index) => {
      const connectionName = suggestion.match(/reach out to (\w+)/i)?.[1] || 
                           suggestion.match(/(\w+) \(/)?.[1];
      
      if (connectionName) {
        const connection = connections.find(c => c.name.toLowerCase().includes(connectionName.toLowerCase()));
        if (connection) {
          reminders.push({
            id: `silk-${index}`,
            connectionId: connection.id,
            connectionName: connection.name,
            type: 'silk_suggestion',
            message: suggestion,
            dueDate: new Date(),
            priority: 'medium',
            silkReason: 'AI-powered relationship insight',
            actionSuggestion: 'Follow Silk\'s suggestion'
          });
        }
      }
    });

    // Sort by priority and date
    return reminders.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };

  const reminders = generateReminders();

  const filteredReminders = reminders.filter(reminder => {
    const today = new Date();
    const isToday = reminder.dueDate.toDateString() === today.toDateString();
    const isOverdue = reminder.dueDate < today;
    
    switch (filter) {
      case 'overdue':
        return reminder.type === 'overdue';
      case 'today':
        return isToday;
      case 'upcoming':
        return reminder.dueDate > today;
      case 'silk':
        return reminder.type === 'silk_suggestion';
      default:
        return true;
    }
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'silk_suggestion':
        return <Brain size={16} style={{ color: currentTheme.colors.primary }} />;
      case 'overdue':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'due_soon':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return currentTheme.colors.primary;
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
              Reminders
            </h1>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              {reminders.length} active reminders • Powered by Silk AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-full"
              style={{ backgroundColor: currentTheme.colors.primary + '20' }}
            >
              <Filter size={18} style={{ color: currentTheme.colors.primary }} />
            </button>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.colors.primary + '20' }}
            >
              <Brain size={20} style={{ color: currentTheme.colors.primary }} />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: reminders.length },
            { key: 'overdue', label: 'Overdue', count: reminders.filter(r => r.type === 'overdue').length },
            { key: 'silk', label: 'Silk AI', count: reminders.filter(r => r.type === 'silk_suggestion').length },
            { key: 'today', label: 'Today', count: reminders.filter(r => {
              const today = new Date();
              return r.dueDate.toDateString() === today.toDateString();
            }).length },
            { key: 'upcoming', label: 'Upcoming', count: reminders.filter(r => r.dueDate > new Date()).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === key ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: filter === key 
                  ? currentTheme.colors.primary 
                  : currentTheme.colors.background,
                color: filter === key 
                  ? 'white' 
                  : currentTheme.colors.textSecondary,
                border: `1px solid ${currentTheme.colors.primary}30`
              }}
            >
              {label}
              {count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-30 text-xs rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              onClick={() => navigate(`/contact/${reminder.connectionId}`)}
              className="p-4 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: getPriorityColor(reminder.priority) + '30',
                borderLeftWidth: '4px',
                borderLeftColor: getPriorityColor(reminder.priority)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getTypeIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      {reminder.connectionName}
                    </h3>
                    <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                      {reminder.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                    {reminder.message}
                  </p>
                  
                  {reminder.actionSuggestion && (
                    <p className="text-xs mb-2 font-medium" style={{ color: currentTheme.colors.primary }}>
                      💡 {reminder.actionSuggestion}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: reminder.type === 'silk_suggestion' 
                          ? currentTheme.colors.primary + '20'
                          : getPriorityColor(reminder.priority) + '20',
                        color: reminder.type === 'silk_suggestion' 
                          ? currentTheme.colors.primary
                          : getPriorityColor(reminder.priority)
                      }}
                    >
                      {reminder.type === 'silk_suggestion' ? 'SILK AI' : reminder.priority.toUpperCase()}
                    </span>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: currentTheme.colors.accent + '20',
                        color: currentTheme.colors.accent
                      }}
                    >
                      {reminder.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {reminder.silkReason && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: currentTheme.colors.health.good + '20',
                          color: currentTheme.colors.health.good
                        }}
                      >
                        {reminder.silkReason}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: currentTheme.colors.primary + '20' }}
            >
              <CheckCircle size={24} style={{ color: currentTheme.colors.primary }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              All caught up!
            </h3>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              {filter === 'silk' 
                ? 'Silk has no new suggestions right now. Check back later!'
                : 'No reminders for this filter. Great job staying connected!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Stats */}
      {reminders.length > 0 && (
        <div className="p-4 border-t" style={{ borderColor: currentTheme.colors.primary + '20' }}>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              Relationship Intelligence
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.health.poor }}>
                  {reminders.filter(r => r.type === 'overdue').length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Overdue
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.health.warning }}>
                  {reminders.filter(r => r.type === 'due_soon').length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Due Soon
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                  {reminders.filter(r => r.type === 'silk_suggestion').length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Silk AI
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.health.good }}>
                  {connections.filter(c => c.healthScore >= 80).length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Healthy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;