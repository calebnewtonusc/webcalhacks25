import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Brain, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConnections } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSilk } from '../contexts/SilkContext';

const AddContact = () => {
  const navigate = useNavigate();
  const { addConnection } = useConnections();
  const { currentTheme } = useTheme();
  const { processNaturalLanguageAdd } = useSilk();

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'friend' as 'family' | 'friend' | 'work' | 'school' | 'other',
    priority: 'P3' as 'P1' | 'P2' | 'P3',
    phone: '',
    email: '',
    notes: '',
    contactFrequency: 30,
    cluster: '',
    tags: [] as string[]
  });

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [showNaturalInput, setShowNaturalInput] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addConnection({
      name: formData.name,
      relationship: formData.relationship,
      priority: formData.priority,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      contactFrequency: formData.contactFrequency,
      cluster: formData.cluster,
      tags: formData.tags,
      lastContact: new Date(),
      funFacts: [],
      importantDates: []
    });

    navigate('/');
  };

  const handleNaturalLanguageSubmit = () => {
    if (naturalLanguageInput.trim()) {
      const result = processNaturalLanguageAdd(naturalLanguageInput);
      
      // Add the connection using the parsed data
      addConnection({
        name: result.name,
        relationship: result.relationship,
        priority: result.priority,
        phone: result.phone,
        email: result.email,
        notes: result.notes,
        tags: result.tags,
        contactFrequency: result.contactFrequency,
        cluster: result.cluster,
        lastContact: result.lastContact,
        funFacts: [],
        importantDates: []
      });
      
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: currentTheme.colors.background }}>
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
            Add Connection
          </h1>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="p-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowNaturalInput(true)}
            className={`flex-1 p-3 rounded-lg font-medium transition-all ${
              showNaturalInput ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: showNaturalInput 
                ? currentTheme.colors.primary 
                : currentTheme.colors.surface,
              color: showNaturalInput 
                ? 'white' 
                : currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.primary}30`
            }}
          >
            <Brain size={16} className="inline mr-2" />
            Natural Language
          </button>
          <button
            onClick={() => setShowNaturalInput(false)}
            className={`flex-1 p-3 rounded-lg font-medium transition-all ${
              !showNaturalInput ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: !showNaturalInput 
                ? currentTheme.colors.primary 
                : currentTheme.colors.surface,
              color: !showNaturalInput 
                ? 'white' 
                : currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.primary}30`
            }}
          >
            <User size={16} className="inline mr-2" />
            Manual Form
          </button>
        </div>
      </div>

      {showNaturalInput ? (
        /* Natural Language Input */
        <div className="p-4">
          <div 
            className="p-6 rounded-2xl border mb-6"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <Brain size={20} style={{ color: currentTheme.colors.primary }} />
              Tell me about this person
            </h2>
            
            <textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="Add my friend Langston Reid from school to my web, priority 1. I hung out with him today and I plan to hang out with him tomorrow too. His hometown is London and he likes indie music. His phone number is 555-123-4567"
              rows={6}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
              style={{ 
                borderColor: currentTheme.colors.primary + '30',
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text
              }}
            />
            
            <div className="mt-4 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              <p className="mb-2">💡 Examples:</p>
              <ul className="space-y-1 text-xs">
                <li>• "Add Andy to my web" (defaults to P3, friend)</li>
                <li>• "Add my colleague Sarah, priority 2, we work together on marketing"</li>
                <li>• "Add my sister Emma, family, priority 1, her birthday is March 15th"</li>
              </ul>
            </div>

            <button
              onClick={handleNaturalLanguageSubmit}
              disabled={!naturalLanguageInput.trim()}
              className="w-full mt-4 py-4 rounded-xl font-semibold text-white text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Save size={20} />
              Add to WEB
            </button>
          </div>
        </div>
      ) : (
        /* Manual Form */
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Name *
                </label>
                <div className="relative">
                  <User 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: currentTheme.colors.textSecondary }}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: currentTheme.colors.primary + '30',
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Relationship
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['family', 'friend', 'work', 'school', 'other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, relationship: type as any }))}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        formData.relationship === type ? 'shadow-md' : ''
                      }`}
                      style={{
                        backgroundColor: formData.relationship === type 
                          ? currentTheme.colors.primary 
                          : currentTheme.colors.surface,
                        color: formData.relationship === type 
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['P1', 'P2', 'P3'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority as any }))}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        formData.priority === priority ? 'shadow-md' : ''
                      }`}
                      style={{
                        backgroundColor: formData.priority === priority 
                          ? currentTheme.colors.primary 
                          : currentTheme.colors.surface,
                        color: formData.priority === priority 
                          ? 'white' 
                          : currentTheme.colors.text,
                        border: `1px solid ${currentTheme.colors.primary}30`
                      }}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Phone
                </label>
                <div className="relative">
                  <Phone 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: currentTheme.colors.textSecondary }}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: currentTheme.colors.primary + '30',
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                  Email
                </label>
                <div className="relative">
                  <Mail 
                    size={18} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: currentTheme.colors.textSecondary }}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: currentTheme.colors.primary + '30',
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How did you meet? What should you remember about them?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
              style={{ 
                borderColor: currentTheme.colors.primary + '30',
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <Save size={20} />
            Add Connection
          </button>
        </form>
      )}
    </div>
  );
};

export default AddContact;