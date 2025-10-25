import React, { useState } from 'react';
import { User, Settings, Target, TrendingUp, Award, BarChart3, Edit3, Save, ArrowLeft, Calendar, MapPin, Clock, MessageSquare } from 'lucide-react';
import { useConnections, getStrengthColor } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const { connections, getAllInteractions } = useConnections();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showAllInteractions, setShowAllInteractions] = useState(false);
  
  // Get onboarding data from localStorage or use defaults
  const getOnboardingData = () => {
    try {
      const stored = sessionStorage.getItem('userProfile');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    
    return {
      name: 'Alex Chen',
      goal: 'maintaining',
      bio: 'Film student at USC, passionate about storytelling and building meaningful connections.'
    };
  };

  const [userProfile, setUserProfile] = useState(getOnboardingData());

  const totalConnections = connections.length;
  const averageStrength = Math.round(
    connections.length > 0 ? connections.reduce((sum, conn) => sum + conn.strength, 0) / connections.length * 10 : 0
  ) / 10;

  const strengthBreakdown = {
    5: connections.filter(c => c.strength === 5).length,
    4: connections.filter(c => c.strength === 4).length,
    3: connections.filter(c => c.strength === 3).length,
    2: connections.filter(c => c.strength === 2).length,
    1: connections.filter(c => c.strength === 1).length,
  };

  const priorityBreakdown = {
    P1: connections.filter(c => c.priority === 'P1').length,
    P2: connections.filter(c => c.priority === 'P2').length,
    P3: connections.filter(c => c.priority === 'P3').length,
  };

  const relationshipBreakdown = {
    family: connections.filter(c => c.relationship === 'family').length,
    friend: connections.filter(c => c.relationship === 'friend').length,
    work: connections.filter(c => c.relationship === 'work').length,
    school: connections.filter(c => c.relationship === 'school').length,
    other: connections.filter(c => c.relationship === 'other').length,
  };

  const weeklyStats = {
    interactions: connections.reduce((sum, c) => sum + c.interactions.length, 0),
    strongConnections: connections.filter(c => c.strength >= 4).length,
    needsAttention: connections.filter(c => c.strength <= 2).length
  };

  const goalLabels = {
    maintaining: 'Maintaining Connections',
    strengthening: 'Strengthening Connections',
    finding: 'Finding Connections',
    visualizing: 'Visualizing Connections'
  };

  const handleSaveProfile = () => {
    sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    onLogout();
  };

  const allInteractions = getAllInteractions();
  const recentInteractions = allInteractions.slice(0, 5);
  const plannedInteractions = [
    { id: 'planned-1', connectionName: 'Sarah Chen', type: 'coffee', date: new Date(Date.now() + 86400000), notes: 'Catch up on her new job' },
    { id: 'planned-2', connectionName: 'Marcus Johnson', type: 'lunch', date: new Date(Date.now() + 172800000), notes: 'Discuss the project' }
  ];

  // Strength calculation explanation
  const strengthExplanation = `
Strength Calculation:

P1 (Weekly Contact Goal):
• 5 ⭐: 0-7 days since contact
• 4 ⭐: 8-10 days since contact  
• 3 ⭐: 11-14 days since contact
• 2 ⭐: 15-21 days since contact
• 1 ⭐: 22+ days since contact

P2 (Bi-weekly Contact Goal):
• 5 ⭐: 0-14 days since contact
• 4 ⭐: 15-18 days since contact
• 3 ⭐: 19-21 days since contact
• 2 ⭐: 22-28 days since contact
• 1 ⭐: 29+ days since contact

P3 (Monthly Contact Goal):
• 5 ⭐: 0-30 days since contact
• 4 ⭐: 31-35 days since contact
• 3 ⭐: 36-42 days since contact
• 2 ⭐: 43-49 days since contact
• 1 ⭐: 50+ days since contact
  `;

  if (showSettings) {
    return (
      <div className="h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        {/* Settings Header */}
        <div 
          className="p-4 border-b"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: currentTheme.colors.text }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
              Settings
            </h1>
          </div>
        </div>

        {/* Settings Options */}
        <div className="p-4 overflow-y-auto pb-24">
          <div className="space-y-4">
            {/* Account Settings */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Account
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  App Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: '#ef4444' + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: '#ef4444'
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Data & Privacy */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Data & Privacy
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Export Data
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Privacy Settings
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Notifications
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Reminder Settings
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Email Preferences
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Push Notifications
                </button>
              </div>
            </div>

            {/* Themes */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Appearance
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Theme Settings
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Display Options
                </button>
              </div>
            </div>

            {/* Help & Support */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Help & Support
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Help Center
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Contact Support
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  About WEB
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Terms of Service
                </button>
                <button
                  className="w-full p-3 rounded-lg border text-left"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Strength Calculation Explanation */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                Strength Legend & Calculation
              </h3>
              
              {/* Strength Legend */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
                  Strength Colors
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((strength) => (
                    <div key={strength} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getStrengthColor(strength) }}
                      />
                      <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        {strength} Star{strength !== 1 ? 's' : ''} - {
                          strength === 5 ? 'Excellent' :
                          strength === 4 ? 'Good' :
                          strength === 3 ? 'Fair' :
                          strength === 2 ? 'Weak' : 'Critical'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
                How Strength is Calculated
              </h4>
              <pre className="text-sm whitespace-pre-line leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                {strengthExplanation}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAllInteractions) {
    return (
      <div className="h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        {/* Timeline Header */}
        <div 
          className="p-4 border-b"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllInteractions(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: currentTheme.colors.text }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
              All Interactions
            </h1>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div 
            className="space-y-4"
          >
            {allInteractions.map((interaction, index) => (
              <div
                key={interaction.id}
                onClick={() => navigate(`/contact/${interaction.connectionId}`)}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {interaction.connectionName}
                    </h4>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {interaction.type} • {interaction.date.toLocaleDateString()}
                    </p>
                    {interaction.notes && (
                      <p className="text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                        {interaction.notes.length > 100 ? interaction.notes.substring(0, 100) + '...' : interaction.notes}
                      </p>
                    )}
                  </div>
                  {interaction.quality && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: currentTheme.colors.health.good + '20',
                        color: currentTheme.colors.health.good
                      }}
                    >
                      {interaction.quality}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {allInteractions.length === 0 && (
              <div 
                className="p-8 rounded-xl border text-center"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <Calendar size={48} className="mx-auto mb-4" style={{ color: currentTheme.colors.textSecondary }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  No interactions yet
                </h3>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Start connecting with people to see your interaction history here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto pb-24" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <User size={24} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                {userProfile.name}
              </h1>
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                Goal: {goalLabels[userProfile.goal as keyof typeof goalLabels]}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full transition-colors"
          >
            <Settings size={20} style={{ color: currentTheme.colors.textSecondary }} />
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '10'
        }}
      >
        <div className="text-center text-sm" style={{ color: currentTheme.colors.textSecondary }}>
          <strong style={{ color: currentTheme.colors.text }}>{totalConnections}</strong> connections • <strong style={{ color: currentTheme.colors.text }}>{averageStrength}/5</strong> avg strength • <strong style={{ color: currentTheme.colors.text }}>{weeklyStats.strongConnections}</strong> strong relationships
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Planned Interactions */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            <Clock size={20} />
            Planned Interactions
          </h2>
          
          <div className="space-y-3">
            {plannedInteractions.map((planned) => (
              <div
                key={planned.id}
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.accent + '20'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {planned.connectionName}
                    </h4>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {planned.type} • {planned.date.toLocaleDateString()}
                    </p>
                    {planned.notes && (
                      <p className="text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                        {planned.notes}
                      </p>
                    )}
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: currentTheme.colors.accent + '20',
                      color: currentTheme.colors.accent
                    }}
                  >
                    Planned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Interactions */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              Recent Interactions
            </h2>
            <button
              onClick={() => setShowAllInteractions(true)}
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.primary + '20',
                color: currentTheme.colors.primary
              }}
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentInteractions.map((interaction, index) => (
              <div
                key={interaction.id}
                onClick={() => navigate(`/contact/${interaction.connectionId}`)}
                className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {interaction.connectionName}
                    </h4>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {interaction.type} • {interaction.date.toLocaleDateString()}
                    </p>
                    {interaction.notes && (
                      <p className="text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                        {interaction.notes.length > 50 ? interaction.notes.substring(0, 50) + '...' : interaction.notes}
                      </p>
                    )}
                  </div>
                  {interaction.quality && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: currentTheme.colors.health.good + '20',
                        color: currentTheme.colors.health.good
                      }}
                    >
                      {interaction.quality}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {recentInteractions.length === 0 && (
              <div 
                className="p-4 rounded-lg border text-center"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <Calendar size={24} className="mx-auto mb-2" style={{ color: currentTheme.colors.textSecondary }} />
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  No recent interactions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              Your Profile
            </h2>
            <button
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              {isEditingProfile ? 'Save' : 'Edit'}
            </button>
          </div>
          
          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Name
                </label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Bio
                </label>
                <textarea
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Primary Goal
                </label>
                <select
                  value={userProfile.goal}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="maintaining">Maintaining Connections</option>
                  <option value="strengthening">Strengthening Connections</option>
                  <option value="finding">Finding Connections</option>
                  <option value="visualizing">Visualizing Connections</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-3" style={{ color: currentTheme.colors.text }}>
                {userProfile.bio || 'No bio added yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Network Overview */}
        <div 
          className="p-6 rounded-2xl border"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            Network Overview
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>
                {totalConnections}
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                Total Connections
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: getStrengthColor(Math.round(averageStrength)) }}>
                {averageStrength}/5
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                Average Strength
              </p>
            </div>
          </div>
        </div>

        {/* Strength Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            Strength Distribution
          </h3>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            {Object.entries(strengthBreakdown).reverse().map(([strength, count]) => (
              <div key={strength} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStrengthColor(parseInt(strength)) }}
                  />
                  <span style={{ color: currentTheme.colors.text }}>
                    {strength} ⭐ - {
                      strength === '5' ? 'Excellent' :
                      strength === '4' ? 'Good' :
                      strength === '3' ? 'Fair' :
                      strength === '2' ? 'Weak' : 'Critical'
                    }
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            Priority Levels
          </h3>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            {Object.entries(priorityBreakdown).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between py-2">
                <span style={{ color: currentTheme.colors.text }}>
                  <strong>{priority}</strong> - {priority === 'P1' ? 'Weekly contact' : priority === 'P2' ? 'Bi-weekly contact' : 'Monthly contact'}
                </span>
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Types */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
            Relationship Types
          </h3>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            {Object.entries(relationshipBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-2">
                <span className="capitalize" style={{ color: currentTheme.colors.text }}>
                  <strong>{type}</strong>
                </span>
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} style={{ color: currentTheme.colors.primary }} />
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              Activity Summary
            </h3>
          </div>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                  {weeklyStats.interactions}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Total Interactions
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: getStrengthColor(4) }}>
                  {weeklyStats.strongConnections}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Strong (4-5⭐)
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: getStrengthColor(1) }}>
                  {weeklyStats.needsAttention}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Needs Attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;