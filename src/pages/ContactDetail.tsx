import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageSquare, Calendar, Plus, Edit3, Brain, Heart, MapPin, Clock, Save } from 'lucide-react';
import { useConnections } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSilk } from '../contexts/SilkContext';
import { getStrengthColor } from '../contexts/ConnectionContext';

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getConnectionById, addInteraction, updateConnection } = useConnections();
  const { currentTheme } = useTheme();
  const { getConnectionMemories, addMemory } = useSilk();
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionType, setInteractionType] = useState<'call' | 'text' | 'email' | 'meeting' | 'social'>('call');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [showMemories, setShowMemories] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const connection = id ? getConnectionById(id) : undefined;
  const connectionMemories = id ? getConnectionMemories(id) : [];

  if (!connection) {
    return (
      <div className="p-4">
        <p>Connection not found</p>
      </div>
    );
  }

  React.useEffect(() => {
    setEditedNotes(connection.notes);
  }, [connection.notes]);

  const handleAddInteraction = () => {
    addInteraction(connection.id, {
      type: interactionType,
      date: new Date(),
      notes: interactionNotes,
      quality: 8,
      mood: 'good'
    });
    
    // Add memory
    if (interactionNotes.trim()) {
      addMemory({
        connectionId: connection.id,
        type: 'conversation',
        content: interactionNotes,
        importance: 7,
        tags: [interactionType, 'recent']
      });
    }
    
    setShowInteractionModal(false);
    setInteractionNotes('');
  };

  const handleSaveNotes = () => {
    updateConnection(connection.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };
  const actionButtons = [
    { icon: Phone, label: 'Call', action: () => setInteractionType('call') },
    { icon: MessageSquare, label: 'Text', action: () => setInteractionType('text') },
    { icon: Mail, label: 'Email', action: () => setInteractionType('email') },
    { icon: Calendar, label: 'Meet', action: () => setInteractionType('meeting') }
  ];

  const daysSinceContact = Math.floor(
    (Date.now() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getProximityIcon = () => {
    switch (connection.proximity) {
      case 'same-city': return <MapPin size={14} className="text-green-500" />;
      case 'long-distance': return <MapPin size={14} className="text-yellow-500" />;
      case 'international': return <MapPin size={14} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: currentTheme.colors.text }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
            Contact Details
          </h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <div 
          className="p-6 rounded-2xl border mb-6"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: getStrengthColor(connection.strength) }}
            >
              {connection.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" style={{ color: currentTheme.colors.text }}>
                {connection.name}
              </h2>
              <p className="text-sm mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                {connection.relationship} • {connection.cluster}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                    Strength:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="text-lg"
                        style={{ 
                          color: star <= connection.strength 
                            ? getStrengthColor(connection.strength) 
                            : currentTheme.colors.textSecondary + '40'
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: getStrengthColor(connection.strength) }}>
                    {connection.strength}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                    Priority:
                  </span>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{ 
                      backgroundColor: connection.priority === 'P1' 
                        ? currentTheme.colors.health.excellent + '20'
                        : connection.priority === 'P2' 
                        ? currentTheme.colors.health.good + '20'
                        : currentTheme.colors.health.warning + '20',
                      color: connection.priority === 'P1' 
                        ? currentTheme.colors.health.excellent
                        : connection.priority === 'P2' 
                        ? currentTheme.colors.health.good
                        : currentTheme.colors.health.warning
                    }}
                  >
                    {connection.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium" style={{ color: currentTheme.colors.text }}>Last Contact</p>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
              </p>
            </div>
            <div>
              <p className="font-medium" style={{ color: currentTheme.colors.text }}>Contact Goal</p>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                Every {connection.contactFrequency} days
              </p>
            </div>
            <div>
              <p className="font-medium" style={{ color: currentTheme.colors.text }}>Interactions</p>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                {connection.interactions.length} total
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {actionButtons.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setShowInteractionModal(true);
                }}
                className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all active:scale-95"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + '30'
                }}
              >
                <Icon size={24} style={{ color: currentTheme.colors.primary }} />
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Silk Memories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <Brain size={20} style={{ color: currentTheme.colors.primary }} />
              Silk Memories
            </h3>
            <button
              onClick={() => setShowMemories(!showMemories)}
              className="text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: currentTheme.colors.primary + '20',
                color: currentTheme.colors.primary
              }}
            >
              {showMemories ? 'Hide' : 'Show'} ({connectionMemories.length})
            </button>
          </div>
          
          {showMemories && (
            <div className="space-y-3">
              {connectionMemories.slice(0, 5).map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: currentTheme.colors.primary + '20',
                        color: currentTheme.colors.primary
                      }}
                    >
                      {memory.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                      {memory.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                    {memory.content}
                  </p>
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: currentTheme.colors.accent + '20',
                            color: currentTheme.colors.accent
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {connectionMemories.length === 0 && (
                <div 
                  className="p-4 rounded-lg border text-center"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    No memories yet. Silk will learn as you interact!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
            Contact Information
          </h3>
          <div 
            className="p-4 rounded-xl border space-y-3"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            {connection.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} style={{ color: currentTheme.colors.primary }} />
                <span style={{ color: currentTheme.colors.text }}>{connection.phone}</span>
              </div>
            )}
            {connection.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} style={{ color: currentTheme.colors.primary }} />
                <span style={{ color: currentTheme.colors.text }}>{connection.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock size={16} style={{ color: currentTheme.colors.primary }} />
              <span style={{ color: currentTheme.colors.text }}>
                Prefers {connection.communicationStyle} • {connection.proximity?.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              Notes
            </h3>
            <button
              onClick={() => {
                if (isEditingNotes) {
                  handleSaveNotes();
                } else {
                  setIsEditingNotes(true);
                }
              }}
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.primary + '20',
                color: currentTheme.colors.primary
              }}
            >
              {isEditingNotes ? <Save size={14} /> : <Edit3 size={14} />}
            </button>
          </div>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            {isEditingNotes ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this person..."
                rows={4}
                className="w-full p-0 border-none focus:outline-none resize-none"
                style={{ 
                  backgroundColor: 'transparent',
                  color: currentTheme.colors.text
                }}
              />
            ) : (
              <p style={{ color: currentTheme.colors.text }}>
                {connection.notes || 'No notes yet. Click edit to add some!'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              Recent Interactions
            </h3>
            <button
              onClick={() => setShowInteractionModal(true)}
              className="p-2 rounded-full"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Plus size={16} color="white" />
            </button>
          </div>
          
          {connection.interactions.length > 0 ? (
            <div className="space-y-3">
              {connection.interactions.slice(-5).reverse().map((interaction) => (
                <div
                  key={interaction.id}
                  className="p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize" style={{ color: currentTheme.colors.text }}>
                      {interaction.type}
                    </span>
                    <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {interaction.quality && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: currentTheme.colors.health.good + '20',
                            color: currentTheme.colors.health.good
                          }}
                        >
                          {interaction.quality}/10
                        </span>
                      )}
                      {interaction.mood && (
                        <span className="text-xs">
                          {interaction.mood === 'great' ? '😊' : 
                           interaction.mood === 'good' ? '🙂' : 
                           interaction.mood === 'neutral' ? '😐' : '😕'}
                        </span>
                      )}
                      {interaction.date.toLocaleDateString()}
                    </span>
                  </div>
                  {interaction.notes && (
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {interaction.notes}
                    </p>
                  )}
                  {interaction.topics && interaction.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {interaction.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: currentTheme.colors.accent + '20',
                            color: currentTheme.colors.accent
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="p-6 rounded-xl border text-center"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <p style={{ color: currentTheme.colors.textSecondary }}>
                No interactions recorded yet
              </p>
            </div>
          )}
        </div>

        {/* Edit Contact Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/edit-contact/${connection.id}`)}
            className="w-full py-3 rounded-lg border font-medium flex items-center justify-center gap-2"
            style={{ 
              borderColor: currentTheme.colors.primary + '30',
              color: currentTheme.colors.primary
            }}
          >
            <Edit3 size={16} />
            Edit Contact
          </button>
        </div>
      </div>

      {/* Interaction Modal */}
      {showInteractionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div 
            className="w-full rounded-t-2xl p-6"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
              Log Interaction
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['call', 'text', 'email', 'meeting', 'social'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setInteractionType(type as any)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      interactionType === type ? 'shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: interactionType === type 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.background,
                      color: interactionType === type 
                        ? 'white' 
                        : currentTheme.colors.text,
                      border: `1px solid ${currentTheme.colors.primary}30`
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Notes (optional)
              </label>
              <textarea
                value={interactionNotes}
                onChange={(e) => setInteractionNotes(e.target.value)}
                placeholder="e.g., Discussed their new job, planned a hiking trip, caught up on family news..."
                rows={4}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text
                }}
              />
              <div className="relative">
                <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
                  {getProximityIcon()}
                  {connection.energyLevel && connection.energyLevel > 7 && (
                    <Heart size={14} className="text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                💡 The more details you add, the better Silk can help you remember and suggest future topics
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInteractionModal(false)}
                className="flex-1 p-3 rounded-lg border font-medium"
                style={{ 
                  borderColor: currentTheme.colors.primary + '30',
                  color: currentTheme.colors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddInteraction}
                className="flex-1 p-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                Log Interaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;