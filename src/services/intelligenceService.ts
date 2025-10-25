import { analyzeRelationshipHealth, generateReconnectionSuggestion, type Connection } from '../lib/claude';

/**
 * Intelligence Service - Provides AI-powered insights and suggestions
 */
export class IntelligenceService {
  /**
   * Get daily relationship insights
   */
  static async getDailyInsights(connections: Connection[]): Promise<string[]> {
    const insights: string[] = [];

    // Find overdue P1 connections
    const overdueP1 = connections.filter(c => {
      if (c.priority !== 'P1') return false;
      const daysSinceContact = Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceContact > 7;
    });

    if (overdueP1.length > 0) {
      insights.push(`🔴 You have ${overdueP1.length} P1 connection(s) that need attention: ${overdueP1.slice(0, 3).map(c => c.name).join(', ')}`);
    }

    // Find low strength connections
    const lowStrength = connections.filter(c => c.strength <= 2);
    if (lowStrength.length > 0) {
      insights.push(`⚠️ ${lowStrength.length} connection(s) are at risk of fading: ${lowStrength.slice(0, 3).map(c => c.name).join(', ')}`);
    }

    // Positive reinforcement
    const strongConnections = connections.filter(c => c.strength >= 4);
    if (strongConnections.length > 0) {
      insights.push(`✅ You're maintaining ${strongConnections.length} strong relationships - keep it up!`);
    }

    return insights;
  }

  /**
   * Generate weekly relationship report
   */
  static async getWeeklyReport(connections: Connection[]): Promise<{
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }> {
    const totalConnections = connections.length;
    const avgStrength = connections.reduce((sum, c) => sum + c.strength, 0) / totalConnections;
    const activeThisWeek = connections.filter(c => {
      const daysSinceContact = Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceContact <= 7;
    }).length;

    return {
      summary: `This week you connected with ${activeThisWeek} people out of ${totalConnections} total connections. Your average relationship strength is ${avgStrength.toFixed(1)}/5.`,
      strengths: [
        `Maintained ${activeThisWeek} active connections this week`,
        `${connections.filter(c => c.strength >= 4).length} strong relationships`,
      ],
      improvements: [
        `${connections.filter(c => c.strength <= 2).length} connections need attention`,
        `Consider reaching out to P1 connections weekly`,
      ],
      suggestions: await this.getActionableSuggestions(connections, 3)
    };
  }

  /**
   * Get personalized action suggestions
   */
  static async getActionableSuggestions(connections: Connection[], count: number = 5): Promise<string[]> {
    const suggestions: string[] = [];

    // Find people who need attention
    const needsAttention = connections
      .filter(c => {
        const daysSinceContact = Math.floor((Date.now() - c.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        const targetDays = c.priority === 'P1' ? 7 : c.priority === 'P2' ? 14 : 30;
        return daysSinceContact > targetDays;
      })
      .sort((a, b) => {
        const aDays = Math.floor((Date.now() - a.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        const bDays = Math.floor((Date.now() - b.lastContact.getTime()) / (1000 * 60 * 60 * 24));
        return bDays - aDays;
      })
      .slice(0, count);

    for (const connection of needsAttention) {
      const suggestion = await generateReconnectionSuggestion(connection);
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Analyze network balance
   */
  static analyzeNetworkBalance(connections: Connection[]): {
    byRelationship: Record<string, number>;
    byPriority: Record<string, number>;
    byStrength: Record<string, number>;
    recommendations: string[];
  } {
    const byRelationship: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byStrength: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    connections.forEach(c => {
      byRelationship[c.relationship] = (byRelationship[c.relationship] || 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
      byStrength[c.strength.toString()] = (byStrength[c.strength.toString()] || 0) + 1;
    });

    const recommendations: string[] = [];

    // Check priority balance
    const p1Count = byPriority['P1'] || 0;
    if (p1Count > 10) {
      recommendations.push('You have many P1 (weekly) connections. Consider if all are truly high priority.');
    }

    // Check relationship diversity
    const relationshipTypes = Object.keys(byRelationship).length;
    if (relationshipTypes < 3) {
      recommendations.push('Consider diversifying your network across different relationship types.');
    }

    // Check strength distribution
    const weakConnections = (byStrength['1'] || 0) + (byStrength['2'] || 0);
    if (weakConnections > connections.length * 0.3) {
      recommendations.push('30%+ of your connections are weak. Focus on strengthening key relationships.');
    }

    return { byRelationship, byPriority, byStrength, recommendations };
  }

  /**
   * Detect relationship patterns
   */
  static detectPatterns(connections: Connection[]): {
    mostActiveDay?: string;
    preferredInteractionType?: string;
    averageResponseTime?: number;
    socialRhythm?: string;
  } {
    // This is a placeholder for more advanced pattern detection
    // In a full implementation, this would analyze interaction history
    return {
      mostActiveDay: 'Saturday',
      preferredInteractionType: 'social',
      averageResponseTime: 2,
      socialRhythm: 'Weekend-focused'
    };
  }

  /**
   * Generate personalized reminders
   */
  static async generateSmartReminders(connections: Connection[]): Promise<Array<{
    type: 'birthday' | 'check-in' | 'follow-up' | 'strength-drop';
    priority: 'high' | 'medium' | 'low';
    connection: Connection;
    message: string;
    suggestedAction: string;
  }>> {
    const reminders: Array<{
      type: 'birthday' | 'check-in' | 'follow-up' | 'strength-drop';
      priority: 'high' | 'medium' | 'low';
      connection: Connection;
      message: string;
      suggestedAction: string;
    }> = [];

    for (const connection of connections) {
      const daysSinceContact = Math.floor((Date.now() - connection.lastContact.getTime()) / (1000 * 60 * 60 * 24));

      // Overdue check-ins
      if (connection.priority === 'P1' && daysSinceContact > 7) {
        reminders.push({
          type: 'check-in',
          priority: 'high',
          connection,
          message: `Haven't connected with ${connection.name} in ${daysSinceContact} days`,
          suggestedAction: 'Send a quick text or call'
        });
      }

      // Strength drops
      if (connection.strength <= 2) {
        reminders.push({
          type: 'strength-drop',
          priority: connection.priority === 'P1' ? 'high' : 'medium',
          connection,
          message: `Relationship strength with ${connection.name} is low (${connection.strength}/5)`,
          suggestedAction: 'Plan a meaningful interaction'
        });
      }
    }

    return reminders.slice(0, 10); // Return top 10 reminders
  }
}
