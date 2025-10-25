import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Tag, Save, Trash2, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnections } from '../contexts/ConnectionContext';
import { useTheme } from '../contexts/ThemeContext';

const EditContact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getConnectionById, updateConnection, deleteConnection } = useConnections();
  const { currentTheme } = useTheme();

  const connection = id ? getConnectionById(id) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'friend' as 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance',
    phone: '',
    email: '',
    notes: '',
    contactFrequency: 14,
    cluster: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    communicationStyle: 'text' as 'text' | 'call' | 'email' | 'in-person',
    proximity: 'same-city' as 'same-city' | 'long-distance' | 'international',
    energyLevel: 5,
    sharedInterests: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Predefined options for dropdowns
  const categoryOptions = ['Family', 'School', 'Work', 'Social', 'Interests', 'Community', 'Professional'];
  const subcategoryOptions = {
    Family: ['Immediate Family', 'Extended Family', 'Family Friends', 'In-Laws'],
    School: ['USC Film Club', 'High School Friends', 'Elementary School', 'Study Groups', 'Classmates'],
    Work: ['Current Team', 'Previous Jobs', 'Industry Network', 'Mentors', 'Freelance Clients'],
    Social: ['Close Friends', 'Party Friends', 'Activity Partners', 'Neighbors', 'Roommates'],
    Interests: ['Hiking Group', 'Book Club', 'Gaming Friends', 'Music Scene', 'Art Community'],
    Community: ['Church', 'Volunteering', 'Local Groups', 'Sports Teams', 'Hobby Clubs'],
    Professional: ['Networking', 'Conferences', 'LinkedIn Connections', 'Industry Events', 'Collaborators']
  };

  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name,
        relationship: connection.relationship,
        phone: connection.phone || '',
        email: connection.email || '',
        notes: connection.notes,
        contactFrequency: connection.contactFrequency,
        cluster: connection.cluster || '',
        category: connection.category || '',
        subcategory: connection.subcategory || '',
        tags: connection.tags,
        communicationStyle: connection.communicationStyle || 'text',
        proximity: connection.proximity || 'same-city',
        energyLevel: connection.energyLevel || 5,
        sharedInterests: connection.sharedInterests || []
      });
    }
  }, [connection]);

  if (!connection) {
    return (
      <div className="p-4">
        <p>Connection not found</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Validate required fields
    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    updateConnection(connection.id, {
      ...formData,
      tags: formData.tags,
      sharedInterests: formData.sharedInterests
    });

    navigate(`/contact/${connection.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      deleteConnection(connection.id);
      navigate('/');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.sharedInterests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        sharedInterests: [...prev.sharedInterests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sharedInterests: prev.sharedInterests.filter(interest => interest !== interestToRemove)
    }));
  };

  const addCustomCategory = () => {
    if (customCategory.trim()) {
      setFormData(prev => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  };

  const addCustomSubcategory = () => {
    if (customSubcategory.trim()) {
      setFormData(prev => ({ ...prev, subcategory: customSubcategory.trim() }));
      setCustomSubcategory('');
      setShowCustomSubcategory(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: currentTheme.colors.text }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
              Edit Contact
            </h1>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Form */}
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
                {['family', 'friend', 'colleague', 'mentor', 'acquaintance'].map((type) => (
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
          </div>
        </div>

        {/* Advanced Fields Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowAdvancedFields(!showAdvancedFields)}
            className="px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ 
              borderColor: currentTheme.colors.primary + '30',
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.primary
            }}
          >
            {showAdvancedFields ? 'Hide Advanced Fields' : 'Show Advanced Fields'}
          </button>
        </div>

        {/* Categories & Organization */}
        {showAdvancedFields && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Categories & Organization
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Category
              </label>
              <div className="space-y-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.surface,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="">Select category...</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                {/* Custom category toggle */}
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(!showCustomCategory)}
                  className="w-full p-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.primary
                  }}
                >
                  {showCustomCategory ? 'Cancel' : 'Create New Category'}
                </button>
                
                {showCustomCategory && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: currentTheme.colors.primary + '30',
                        backgroundColor: currentTheme.colors.surface,
                        color: currentTheme.colors.text
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomCategory}
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Subcategory
              </label>
              <div className="space-y-2">
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.surface,
                    color: currentTheme.colors.text
                  }}
                  disabled={!formData.category}
                >
                  <option value="">Select subcategory...</option>
                  {formData.category && subcategoryOptions[formData.category as keyof typeof subcategoryOptions]?.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
                
                {/* Custom subcategory toggle */}
                <button
                  type="button"
                  onClick={() => setShowCustomSubcategory(!showCustomSubcategory)}
                  className="w-full p-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.primary
                  }}
                >
                  {showCustomSubcategory ? 'Cancel' : 'Create New Subcategory'}
                </button>
                
                {showCustomSubcategory && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      placeholder="Enter new subcategory name"
                      className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: currentTheme.colors.primary + '30',
                        backgroundColor: currentTheme.colors.surface,
                        color: currentTheme.colors.text
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomSubcategory}
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Cluster/Group
              </label>
              <input
                type="text"
                value={formData.cluster}
                onChange={(e) => setFormData(prev => ({ ...prev, cluster: e.target.value }))}
                placeholder="e.g., College Friends, Work Team"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: currentTheme.colors.primary + '30',
                  backgroundColor: currentTheme.colors.surface,
                  color: currentTheme.colors.text
                }}
              />
            </div>
          </div>
        </div>
        )}

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

        {/* Preferences */}
        {showAdvancedFields && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Communication Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['text', 'call', 'email', 'in-person'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, communicationStyle: style as any }))}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      formData.communicationStyle === style ? 'shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: formData.communicationStyle === style 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.surface,
                      color: formData.communicationStyle === style 
                        ? 'white' 
                        : currentTheme.colors.text,
                      border: `1px solid ${currentTheme.colors.primary}30`
                    }}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Proximity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['same-city', 'long-distance', 'international'].map((prox) => (
                  <button
                    key={prox}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, proximity: prox as any }))}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      formData.proximity === prox ? 'shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: formData.proximity === prox 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.surface,
                      color: formData.proximity === prox 
                        ? 'white' 
                        : currentTheme.colors.text,
                      border: `1px solid ${currentTheme.colors.primary}30`
                    }}
                  >
                    {prox.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Contact Frequency
              </label>
              <select
                value={formData.contactFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, contactFrequency: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: currentTheme.colors.primary + '30',
                  backgroundColor: currentTheme.colors.surface,
                  color: currentTheme.colors.text
                }}
              >
                <option value={7}>Weekly</option>
                <option value={14}>Every 2 weeks</option>
                <option value={30}>Monthly</option>
                <option value={60}>Every 2 months</option>
                <option value={90}>Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                Energy Level (1-10): {formData.energyLevel}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                <span>Draining</span>
                <span>Energizing</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: currentTheme.colors.primary + '30',
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: currentTheme.colors.primary + '20',
                  color: currentTheme.colors.primary
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Shared Interests */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
            Shared Interests
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              placeholder="Add an interest"
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: currentTheme.colors.primary + '30',
                backgroundColor: currentTheme.colors.surface,
                color: currentTheme.colors.text
              }}
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.sharedInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: currentTheme.colors.health.good + '20',
                  color: currentTheme.colors.health.good
                }}
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
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
          className="w-full py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Save size={20} />
          Save Changes
        </button>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/contact/${connection.id}`)}
            className="py-3 rounded-lg border font-medium"
            style={{ 
              borderColor: currentTheme.colors.primary + '30',
              color: currentTheme.colors.text
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to duplicate this contact?')) {
                const duplicateData = { ...formData, name: formData.name + ' (Copy)' };
                // This would create a new contact with the same data
                console.log('Duplicating contact:', duplicateData);
              }
            }}
            className="py-3 rounded-lg border font-medium"
            style={{ 
              borderColor: currentTheme.colors.accent + '30',
              color: currentTheme.colors.accent
            }}
          >
            Duplicate
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContact;