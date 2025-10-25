import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSilk } from '../contexts/SilkContext';
import { useTheme } from '../contexts/ThemeContext';

const VoiceInterface = () => {
  const { isListening, setIsListening, processVoiceCommand } = useSilk();
  const { currentTheme } = useTheme();
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate voice recognition for demo
  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => {
        const demoCommands = [
          "Mark that I got coffee with Sarah yesterday",
          "Show me my college friends with low health scores",
          "Who should I reach out to this week?",
          "Plan a group hangout with my USC crew",
          "Add that Marcus is moving to Seattle next month"
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        
        setTranscript(randomCommand);
        setIsProcessing(true);
        
        setTimeout(() => {
          processVoiceCommand(randomCommand);
          setIsListening(false);
          setTranscript('');
          setIsProcessing(false);
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isListening, processVoiceCommand]);

  if (!isListening && !transcript) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full"
          style={{ backgroundColor: currentTheme.colors.surface }}
          initial={{ y: 50 }}
          animate={{ y: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: currentTheme.colors.primary }}
              animate={isListening ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {isListening ? (
                <Mic size={32} color="white" />
              ) : (
                <MicOff size={32} color="white" />
              )}
            </motion.div>

            <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Command'}
            </h3>

            {transcript && (
              <div 
                className="p-3 rounded-lg border mb-4"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.primary + '20'
                }}
              >
                <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                  "{transcript}"
                </p>
              </div>
            )}

            <p className="text-sm mb-4" style={{ color: currentTheme.colors.textSecondary }}>
              {isListening 
                ? 'Speak naturally. Try "Mark that I got coffee with Sarah" or "Who should I reach out to?"'
                : isProcessing
                ? 'Understanding your command...'
                : 'Command received!'
              }
            </p>

            {isListening && (
              <motion.div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                    animate={{
                      scaleY: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {!isProcessing && (
              <button
                onClick={() => {
                  setIsListening(false);
                  setTranscript('');
                }}
                className="mt-4 px-6 py-2 rounded-full border"
                style={{ 
                  borderColor: currentTheme.colors.primary + '30',
                  color: currentTheme.colors.text
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceInterface;