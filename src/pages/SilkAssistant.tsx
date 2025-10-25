import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSilk } from '../contexts/SilkContext';
import { useTheme } from '../contexts/ThemeContext';
import { useConnections } from '../contexts/ConnectionContext';

const SilkAssistant = () => {
  const { 
    messages, 
    sendMessage, 
    isListening,
    setIsListening,
    processVoiceCommand
  } = useSilk();
  const { currentTheme } = useTheme();
  const { connections, updateConnection, addInteraction } = useConnections();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate voice recognition for demo
      setTimeout(() => {
        const demoCommands = [
          "Today I hung out with Jeremy and Leo",
          "Move Langston and Mark both to P1 I want to hangout with them more",
          "John's phone number is 555-123-4567",
          "Rianna's birthday is January 24 2007",
          "I had coffee with Sarah yesterday and we talked about her new job"
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        processVoiceCommand(randomCommand);
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: currentTheme.colors.background }}>
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
              Your relationship data assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed above navigation */}
      <div 
        className="p-4 border-t"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.primary + '20'
        }}
      >
        <div className="flex gap-2 mb-20">
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
            placeholder={isListening ? "Listening..." : "Tell me about your interactions, update priorities, add info..."}
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
        
        <div className="mt-2 text-xs max-w-sm mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
          <p>💡 Try: "I hung out with Sarah today" • "Who should I reach out to?" • "Show me my work connections"</p>
        </div>
      </div>
    </div>
  );
};

export default SilkAssistant;