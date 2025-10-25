import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HealthBarProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({ score, size = 'md', showLabel = false }) => {
  const { currentTheme } = useTheme();

  const getHealthColor = (score: number) => {
    if (score >= 80) return currentTheme.colors.health.excellent;
    if (score >= 60) return currentTheme.colors.health.good;
    if (score >= 40) return currentTheme.colors.health.warning;
    return currentTheme.colors.health.poor;
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  const sizeClasses = {
    sm: 'h-2 w-16',
    md: 'h-3 w-24',
    lg: 'h-4 w-32'
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor: getHealthColor(score)
          }}
        />
      </div>
      {showLabel && (
        <span 
          className="text-sm font-medium"
          style={{ color: getHealthColor(score) }}
        >
          {getHealthLabel(score)}
        </span>
      )}
    </div>
  );
};

export default HealthBar;