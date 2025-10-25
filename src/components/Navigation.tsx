import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, Brain, Bell, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Globe, label: 'Web' },
    { path: '/assistant', icon: Brain, label: 'Silk' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  // Hide navigation on certain pages
  if (location.pathname.includes('/contact/') || 
      location.pathname.includes('/add-contact') || 
      location.pathname.includes('/edit-contact') ||
      location.pathname.includes('/settings')) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 w-full border-t z-50 safe-area-inset-bottom"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.primary + '20'
      }}
    >
      <div className="flex justify-around py-2 px-4 max-w-sm mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1"
              style={{
                color: isActive ? currentTheme.colors.primary : currentTheme.colors.textSecondary
              }}
            >
              <Icon 
                size={22} 
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-xs mt-1 font-medium truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;