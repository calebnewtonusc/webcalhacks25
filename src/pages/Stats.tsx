import React from 'react';
import { TrendingUp, Users, Calendar, Target, Award, BarChart3 } from 'lucide-react';
import { useConnections } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSilk } from '../contexts/SilkContext';

const Stats = () => {
  const { connections } = useConnections();
  const { currentTheme } = useTheme();
  const { memories, userPatterns } = useSilk();

  const totalConnections = connections.length;
  const averageHealth = Math.round(
    connections.reduce((sum, conn) => sum + conn.healthScore, 0) / connections.length
  );
  const healthyConnections = connections.filter(conn => conn.healthScore >= 80).length;
  const criticalConnections = connections.filter(conn => conn.healthScore < 40).length;

  const relationshipBreakdown = {
    family: connections.filter(c => c.relationship === 'family').length,
    friend: connections.filter(c => c.relationship === 'friend').length,
    colleague: connections.filter(c => c.relationship === 'colleague').length,
    mentor: connections.filter(c => c.relationship === 'mentor').length,
    acquaintance: connections.filter(c => c.relationship === 'acquaintance').length,
  };

  const weeklyStats = {
    interactions: 12,
    peopleContacted: 8,
    healthImprovement: 5
  };

  const monthlyGoals = [
    { title: 'Weekly Connections', current: 5, target: 7, unit: 'people' },
    { title: 'Average Health', current: averageHealth, target: 85, unit: '%' },
    { title: 'Monthly Meetups', current: 3, target: 5, unit: 'meetings' }
  ];

  return (
    <div className="pb-20" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <BarChart3 size={24} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
              Your Stats
            </h1>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Social insights & analytics
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4">
        <div 
          className="p-6 rounded-2xl border mb-6"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
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
              <p className="text-3xl font-bold" style={{ color: currentTheme.colors.health.good }}>
                {averageHealth}%
              </p>
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                Average Health
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: currentTheme.colors.health.excellent }}>
                {healthyConnections}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                Healthy (80%+)
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: currentTheme.colors.health.poor }}>
                {criticalConnections}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                Need Attention
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} style={{ color: currentTheme.colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              This Week's Activity
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
                  Interactions
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.health.good }}>
                  {weeklyStats.peopleContacted}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  People Contacted
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.health.excellent }}>
                  +{weeklyStats.healthImprovement}%
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Health Improvement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
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
                  {type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                    {count}
                  </span>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} style={{ color: currentTheme.colors.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              Monthly Goals
            </h3>
          </div>
          <div className="space-y-3">
            {monthlyGoals.map((goal, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                    {goal.title}
                  </span>
                  <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (goal.current / goal.target) * 100)}%`,
                      backgroundColor: currentTheme.colors.primary
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Silk Intelligence */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
            Silk Intelligence
          </h3>
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                  {memories.length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Memories Stored
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                  {userPatterns.length}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Patterns Learned
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;