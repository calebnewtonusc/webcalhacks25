import React from 'react';
import { ArrowLeft, Palette, Bell, Shield, HelpCircle, Info, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const navigate = useNavigate();

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: Palette,
          label: 'Theme',
          description: 'Customize your app appearance',
          action: 'theme'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Reminder Settings',
          description: 'Manage when you get reminded',
          action: 'notifications'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Shield,
          label: 'Data Privacy',
          description: 'Control your data and privacy',
          action: 'privacy'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help using the app',
          action: 'help'
        },
        {
          icon: Info,
          label: 'About',
          description: 'App version and information',
          action: 'about'
        }
      ]
    }
  ];

  const [showThemeSelector, setShowThemeSelector] = React.useState(false);

  const handleSettingClick = (action: string) => {
    switch (action) {
      case 'theme':
        setShowThemeSelector(true);
        break;
      case 'notifications':
        // Handle notifications settings
        break;
      case 'privacy':
        // Handle privacy settings
        break;
      case 'help':
        // Handle help
        break;
      case 'about':
        // Handle about
        break;
    }
  };

  return (
    <div className="min-h-screen pb-20 overflow-y-auto" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: currentTheme.colors.text }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              {section.title}
            </h2>
            <div 
              className="rounded-xl border overflow-hidden"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleSettingClick(item.action)}
                  className={`w-full p-4 flex items-center gap-3 transition-colors hover:bg-opacity-50 ${
                    itemIndex !== section.items.length - 1 ? 'border-b' : ''
                  }`}
                  style={{ 
                    borderColor: currentTheme.colors.primary + '10'
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.colors.primary + '20' }}
                  >
                    <item.icon size={18} style={{ color: currentTheme.colors.primary }} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {item.label}
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: currentTheme.colors.textSecondary }} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div 
          className="p-4 rounded-xl border text-center"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.primary + '20'
          }}
        >
          <h3 className="font-semibold mb-1" style={{ color: currentTheme.colors.text }}>
            Connection Web
          </h3>
          <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            Version 1.0.0 • Made with ❤️
          </p>
        </div>
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div 
            className="w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto my-auto"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Choose Theme
              </h3>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} style={{ color: currentTheme.colors.textSecondary }} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setShowThemeSelector(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    currentTheme.id === theme.id ? 'shadow-lg scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    borderColor: currentTheme.id === theme.id 
                      ? theme.colors.primary 
                      : theme.colors.primary + '30',
                    backgroundColor: theme.colors.background,
                    transform: currentTheme.id === theme.id ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-lg" style={{ color: theme.colors.text }}>
                        {theme.name}
                      </span>
                      {currentTheme.id === theme.id && (
                        <span className="ml-2 text-sm px-2 py-1 rounded-full" style={{ 
                          backgroundColor: theme.colors.primary + '20',
                          color: theme.colors.primary 
                        }}>
                          ✓ Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div className="flex-1" />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.health.excellent }}
                      title="Health Colors"
                    />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.health.good }}
                    />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.health.warning }}
                    />
                    <div 
                      className="w-6 h-6 rounded-lg shadow-sm border border-white"
                      style={{ backgroundColor: theme.colors.health.poor }}
                    />
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowThemeSelector(false)}
              className="w-full p-3 rounded-lg border font-medium"
              style={{ 
                borderColor: currentTheme.colors.primary + '30',
                color: currentTheme.colors.text,
                backgroundColor: currentTheme.colors.background
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;