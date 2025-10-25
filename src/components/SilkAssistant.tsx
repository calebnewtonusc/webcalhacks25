import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Lightbulb, Mic, MicOff, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSilk } from '../contexts/SilkContext';
import { useTheme } from '../contexts/ThemeContext';

const SilkAssistant = () => {
  const { 
    messages, 
    isOpen, 
    setIsOpen, 
    sendMessage, 
    getSuggestions, 
    memories,
    userPatterns,
    isListening,
    setIsListening,
    processVoiceCommand
  } = useSilk();
  const { currentTheme } = useTheme();
  const [inputMessage, setInputMessage] = useState('');
  const [showMemories, setShowMemories] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestions = getSuggestions();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      // In a real app, this would stop speech recognition
    } else {
      setIsListening(true);
      // In a real app, this would start speech recognition
      // For demo, we'll simulate voice input after 2 seconds
      setTimeout(() => {
        const demoCommands = [
          "Mark that I got coffee with Sarah yesterday",
          "Show me my college friends",
          "Who should I reach out to this week?",
          "Plan a hangout with my hiking group"
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        processVoiceCommand(randomCommand);
        setIsListening(false);
      }, 2000);
    }
  };

  const recentMemories = memories
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <>
      {/* Silk Assistant Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
        style={{ backgroundColor: currentTheme.colors.primary }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Brain size={24} color="white" />
        {suggestions.length > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-xs text-white font-bold">{suggestions.length}</span>
          </motion.div>
        )}
      </motion.button>

      {/* Silk Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  <Brain size={20} color="white" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                    Silk
                  </h3>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    Relationship Intelligence • {memories.length} memories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMemories(!showMemories)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: showMemories ? currentTheme.colors.primary : currentTheme.colors.textSecondary }}
                >
                  <Lightbulb size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} style={{ color: currentTheme.colors.textSecondary }} />
                </button>
              </div>
            </div>

            {/* Memory Panel */}
            <AnimatePresence>
              {showMemories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b overflow-hidden"
                  style={{ 
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <div className="p-4">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                      Recent Memories
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recentMemories.map((memory) => (
                        <div
                          key={memory.id}
                          className="p-2 rounded-lg border text-xs"
                          style={{ 
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.primary + '20'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="px-1.5 py-0.5 rounded text-xs font-medium"
                              style={{ 
                                backgroundColor: currentTheme.colors.primary + '20',
                                color: currentTheme.colors.primary
                              }}
                            >
                              {memory.type}
                            </span>
                            <span style={{ color: currentTheme.colors.textSecondary }}>
                              {memory.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ color: currentTheme.colors.text }}>
                            {memory.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.primary + '20' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} style={{ color: currentTheme.colors.primary }} />
                  <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                    Smart Suggestions
                  </span>
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3 rounded-lg border transition-colors"
                      style={{ 
                        borderColor: currentTheme.colors.primary + '30',
                        backgroundColor: currentTheme.colors.surface
                      }}
                    >
                      <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      message.isUser 
                        ? 'rounded-br-md' 
                        : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor: message.isUser 
                        ? currentTheme.colors.primary 
                        : currentTheme.colors.surface,
                      color: message.isUser 
                        ? 'white' 
                        : currentTheme.colors.text
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                    {message.actionItems && message.actionItems.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.actionItems.map((action, index) => (
                          <button
                            key={index}
                            className="block w-full text-left text-xs p-2 rounded border opacity-80 hover:opacity-100"
                            style={{ 
                              borderColor: message.isUser ? 'rgba(255,255,255,0.3)' : currentTheme.colors.primary + '30',
                              color: message.isUser ? 'white' : currentTheme.colors.text
                            }}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                    <p 
                      className="text-xs mt-2 opacity-70"
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div 
              className="p-4 border-t"
              style={{ 
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceToggle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isListening ? 'animate-pulse' : ''
                  }`}
                  style={{ 
                    backgroundColor: isListening 
                      ? '#ef4444' 
                      : currentTheme.colors.primary + '20',
                    color: isListening ? 'white' : currentTheme.colors.primary
                  }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening..." : "Ask Silk anything about your relationships..."}
                  disabled={isListening}
                  className="flex-1 p-3 rounded-full border focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isListening}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                >
                  <Send size={18} color="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SilkAssistant;