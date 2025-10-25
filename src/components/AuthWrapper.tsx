import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Users, Briefcase, GraduationCap, HandHeart, X, Plus, Trash2, ArrowRight, Mail, Target, Globe, Calendar, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  priority?: 'P1' | 'P2' | 'P3';
  relationship?: 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance';
  recentInteraction?: 'this-week' | 'this-month' | 'none';
}

interface UserProfile {
  name: string;
  email: string;
  goal: 'maintaining' | 'strengthening' | 'finding' | 'visualizing';
}

interface AuthWrapperProps {
  onComplete: () => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'account' | 'questions' | 'priority' | 'relationship' | 'interactions' | 'goals'>('welcome');
  const [people, setPeople] = useState<Person[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    goal: 'maintaining'
  });
  const [peopleInput, setPeopleInput] = useState('');
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [draggedPerson, setDraggedPerson] = useState<string | null>(null);

  // Questions state
  const [closestPeople, setClosestPeople] = useState('');
  const [getCloserPeople, setGetCloserPeople] = useState('');
  const [maintainPeople, setMaintainPeople] = useState('');

  // Interactions state
  const [thisWeekPeople, setThisWeekPeople] = useState('');
  const [thisMonthPeople, setThisMonthPeople] = useState('');

  const addPeopleFromInput = (input: string) => {
    const names = input.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const newPeople = names.map(name => ({
      id: Date.now().toString() + Math.random(),
      name
    }));
    setPeople(prev => [...prev, ...newPeople]);
  };

  const addPeopleFromQuestions = () => {
    const allAnswers = [closestPeople, getCloserPeople, maintainPeople].join(', ');
    addPeopleFromInput(allAnswers);
    setPeopleInput('');
    setClosestPeople('');
    setGetCloserPeople('');
    setMaintainPeople('');
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePersonPriority = (id: string, priority: 'P1' | 'P2' | 'P3') => {
    setPeople(people.map(p => p.id === id ? { ...p, priority } : p));
  };

  const updatePersonRelationship = (id: string, relationship: 'family' | 'friend' | 'colleague' | 'mentor' | 'acquaintance') => {
    setPeople(people.map(p => p.id === id ? { ...p, relationship } : p));
  };

  const processInteractions = () => {
    const thisWeekNames = thisWeekPeople.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const thisMonthNames = thisMonthPeople.split(',').map(name => name.trim()).filter(name => name.length > 0);
    
    setPeople(prev => prev.map(person => {
      if (thisWeekNames.some(name => person.name.toLowerCase().includes(name.toLowerCase()))) {
        return { ...person, recentInteraction: 'this-week' };
      } else if (thisMonthNames.some(name => person.name.toLowerCase().includes(name.toLowerCase()))) {
        return { ...person, recentInteraction: 'this-month' };
      }
      return { ...person, recentInteraction: 'none' };
    }));
  };

  const completeOnboarding = () => {
    const onboardingData = {
      userProfile,
      people: people,
      completedAt: new Date().toISOString()
    };
    sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    onComplete();
  };

  const useDummyData = () => {
    const dummyProfile: UserProfile = {
      name: 'Alex Chen',
      email: 'alex@example.com',
      goal: 'maintaining'
    };
    setUserProfile(dummyProfile);
    
    // This will be handled by ConnectionContext dummy data
    console.log('🔥 USING DUMMY DATA - skipping onboarding');

    // Clear any existing onboarding data so ConnectionContext uses dummy data
    sessionStorage.removeItem('onboardingData');
    
    // Set minimal onboarding data to trigger dummy data generation
    const minimalOnboardingData = {
      userProfile: dummyProfile,
      people: [], // Empty so ConnectionContext will use its dummy data
      completedAt: new Date().toISOString()
    };
    sessionStorage.setItem('onboardingData', JSON.stringify(minimalOnboardingData));
    onComplete();
  };

  const getUnassignedPeople = (type: 'priority' | 'relationship') => {
    return people.filter(p => type === 'priority' ? !p.priority : !p.relationship);
  };

  const allPeopleHavePriorities = people.length > 0 && people.every(p => p.priority);
  const allPeopleHaveRelationships = people.length > 0 && people.every(p => p.relationship);

  const goBack = () => {
    if (currentStep === 'account') setCurrentStep('welcome');
    else if (currentStep === 'questions') setCurrentStep('account');
    else if (currentStep === 'priority') setCurrentStep('questions');
    else if (currentStep === 'relationship') setCurrentStep('priority');
    else if (currentStep === 'interactions') setCurrentStep('relationship');
    else if (currentStep === 'goals') setCurrentStep('interactions');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, personId: string) => {
    setDraggedPerson(personId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, priority: 'P1' | 'P2' | 'P3') => {
    e.preventDefault();
    if (draggedPerson) {
      updatePersonPriority(draggedPerson, priority);
      setDraggedPerson(null);
    }
  };

  const renderWelcomeView = () => (
    <div className="max-w-md mx-auto text-center p-4 h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <Globe className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">WEB</h1>
          <p className="text-gray-600 text-lg">
            Visualize and strengthen your relationships
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep('account')}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
          >
            Get Started
          </button>
          
          <button
            onClick={useDummyData}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Skip & Use Demo Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountView = () => (
    <div className="max-w-md mx-auto p-4 h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full">
        <div className="text-center mb-8">
          <User className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Tell us about yourself</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep('questions')}
              disabled={!userProfile.name.trim() || !userProfile.email.trim()}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestionsView = () => (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your People</h2>
            <p className="text-gray-600">Help us understand your relationships</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who are the closest people in your life?
              </label>
              <textarea
                value={closestPeople}
                onChange={(e) => setClosestPeople(e.target.value)}
                placeholder="e.g., Mom, Sarah, Marcus, Emily..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who are some people you want to get closer to?
              </label>
              <textarea
                value={getCloserPeople}
                onChange={(e) => setGetCloserPeople(e.target.value)}
                placeholder="e.g., Alex from work, Jessica, my neighbor Tom..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who are some people you want to maintain over time?
              </label>
              <textarea
                value={maintainPeople}
                onChange={(e) => setMaintainPeople(e.target.value)}
                placeholder="e.g., college friends, former colleagues, family friends..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or add people directly (comma separated)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={peopleInput}
                  onChange={(e) => setPeopleInput(e.target.value)}
                  placeholder="John, Sarah, Mom, Alex..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={() => {
                    addPeopleFromInput(peopleInput);
                    setPeopleInput('');
                  }}
                  disabled={!peopleInput.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {people.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your People ({people.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {people.map((person) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">{person.name}</span>
                      <button
                        onClick={() => deletePerson(person.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  addPeopleFromQuestions();
                  setCurrentStep('priority');
                }}
                disabled={!closestPeople.trim() && !getCloserPeople.trim() && !maintainPeople.trim() && people.length === 0}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Continue to Priorities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPriorityView = () => {
    const unassigned = getUnassignedPeople('priority');
    const currentPerson = unassigned[0];
    const assignedPeople = people.filter(p => p.priority);

    if (!currentPerson && allPeopleHavePriorities) {
      return (
        <div className="h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Set!</h2>
            <p className="text-gray-600 mb-6">Everyone has been assigned a priority level.</p>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('relationship')}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentPerson) {
      return (
        <div className="h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
            <p className="text-gray-600 mb-4">No people to assign priorities to.</p>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('relationship')}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    const priorityBins = [
      { key: 'P1', label: 'P1 - High Priority', desc: 'Contact weekly', color: 'green' },
      { key: 'P2', label: 'P2 - Medium Priority', desc: 'Contact bi-weekly', color: 'yellow' },
      { key: 'P3', label: 'P3 - Low Priority', desc: 'Contact monthly', color: 'orange' }
    ];

    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Priority Assignment</h2>
            <p className="text-gray-600">Drag {currentPerson.name} to a priority bin</p>
            <p className="text-sm text-gray-500">{unassigned.length} people remaining</p>
          </div>
        </div>

        {/* Priority Bins */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {priorityBins.map((bin) => (
            <div
              key={bin.key}
              className={`min-h-24 p-4 rounded-xl border-2 border-dashed transition-all ${
                bin.color === 'green' ? 'border-green-300 bg-green-50' :
                bin.color === 'yellow' ? 'border-yellow-300 bg-yellow-50' :
                'border-orange-300 bg-orange-50'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, bin.key as 'P1' | 'P2' | 'P3')}
            >
              <div className="text-center mb-3">
                <h3 className={`font-bold ${
                  bin.color === 'green' ? 'text-green-700' :
                  bin.color === 'yellow' ? 'text-yellow-700' :
                  'text-orange-700'
                }`}>
                  {bin.label}
                </h3>
                <p className={`text-sm ${
                  bin.color === 'green' ? 'text-green-600' :
                  bin.color === 'yellow' ? 'text-yellow-600' :
                  'text-orange-600'
                }`}>
                  {bin.desc}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {assignedPeople.filter(p => p.priority === bin.key).map((person) => (
                  <div
                    key={person.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, person.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium cursor-move ${
                      bin.color === 'green' ? 'bg-green-200 text-green-800' :
                      bin.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-orange-200 text-orange-800'
                    }`}
                  >
                    {person.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current Person */}
        <div className="p-4 bg-white border-t">
          <div className="text-center mb-4">
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, currentPerson.id)}
              className="inline-block px-6 py-3 bg-indigo-100 text-indigo-800 rounded-full font-medium cursor-move"
            >
              {currentPerson.name}
            </div>
            <p className="text-sm text-gray-500 mt-2">Drag to a priority bin above</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                updatePersonPriority(currentPerson.id, 'P3');
              }}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Skip (P3)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRelationshipView = () => {
    const unassigned = getUnassignedPeople('relationship');
    const currentPerson = unassigned[0];

    if (!currentPerson && allPeopleHaveRelationships) {
      return (
        <div className="h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Set!</h2>
            <p className="text-gray-600 mb-6">Everyone has been assigned a relationship type.</p>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setCurrentStep('interactions');
                  setCurrentPersonIndex(0);
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentPerson) {
      return (
        <div className="h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
            <p className="text-gray-600 mb-4">No people to assign relationships to.</p>
            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setCurrentStep('interactions');
                  setCurrentPersonIndex(0);
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    const relationshipCategories = [
      { key: 'family', label: 'Family', icon: Heart, color: 'red' },
      { key: 'friend', label: 'Friend', icon: Users, color: 'blue' },
      { key: 'colleague', label: 'Colleague', icon: Briefcase, color: 'purple' },
      { key: 'mentor', label: 'Mentor', icon: GraduationCap, color: 'green' },
      { key: 'acquaintance', label: 'Acquaintance', icon: HandHeart, color: 'gray' }
    ];

    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-white border-b">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Relationship Assignment</h2>
            <p className="text-gray-600">What's your relationship with {currentPerson.name}?</p>
            <p className="text-sm text-gray-500">{unassigned.length} people remaining</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {relationshipCategories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                updatePersonRelationship(currentPerson.id, key as any);
              }}
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-4"
            >
              <Icon className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-800">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-white border-t">
          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                updatePersonRelationship(currentPerson.id, 'acquaintance');
              }}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Skip (Acquaintance)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInteractionsView = () => (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Recent Interactions</h2>
            <p className="text-gray-600">Help us set accurate relationship strengths (optional)</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who have you hung out with this week?
              </label>
              <textarea
                value={thisWeekPeople}
                onChange={(e) => setThisWeekPeople(e.target.value)}
                placeholder="e.g., Sarah, Marcus, Mom..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who have you hung out with this month? (not mentioned above)
              </label>
              <textarea
                value={thisMonthPeople}
                onChange={(e) => setThisMonthPeople(e.target.value)}
                placeholder="e.g., Jessica, Alex, college friends..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('goals')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  processInteractions();
                  setCurrentStep('goals');
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsView = () => (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Target className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Goals</h2>
            <p className="text-gray-600">What's your primary focus with relationships?</p>
          </div>

          <div className="space-y-4">
            {[
              { value: 'maintaining', label: 'Maintaining Connections', desc: 'Keep current relationships strong' },
              { value: 'strengthening', label: 'Strengthening Connections', desc: 'Deepen existing relationships' },
              { value: 'finding', label: 'Finding Connections', desc: 'Meet new people and expand network' },
              { value: 'visualizing', label: 'Visualizing Connections', desc: 'Better understand relationship patterns' }
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setUserProfile(prev => ({ ...prev, goal: value as any }))}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  userProfile.goal === value
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={completeOnboarding}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2"
            >
              Complete Setup
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderWelcomeView()}
            </motion.div>
          )}
          {currentStep === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderAccountView()}
            </motion.div>
          )}
          {currentStep === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderQuestionsView()}
            </motion.div>
          )}
          {currentStep === 'priority' && (
            <motion.div
              key="priority"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPriorityView()}
            </motion.div>
          )}
          {currentStep === 'relationship' && (
            <motion.div
              key="relationship"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderRelationshipView()}
            </motion.div>
          )}
          {currentStep === 'interactions' && (
            <motion.div
              key="interactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderInteractionsView()}
            </motion.div>
          )}
          {currentStep === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderGoalsView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthWrapper;