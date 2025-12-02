import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import axios from 'axios';

// IMPORTANT: Replace with your actual FastAPI URL
const FAST_API_URL = "http://localhost:8000"; // Assuming FastAPI runs on 8000
const CONTROL_MODES = ["manual", "auto"];
const STATES = ["normal", "focus", "confused", "stressed"];

const StateIndicator = ({ state }) => {
  const getStyle = (s) => {
    switch (s) {
      case 'focus': return { color: 'green', text: 'FOCUS 🚀' };
      case 'confused': return { color: 'orange', text: 'CONFUSED 🤔' };
      case 'stressed': return { color: 'red', text: 'STRESSED 😟' };
      default: return { color: 'gray', text: 'NORMAL' };
    }
  };
  const { color, text } = getStyle(state);

  return (
    <motion.div
      className="text-xs font-semibold px-2 py-1 rounded-full border"
      style={{ color: color, borderColor: color }}
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Brain size={12} className="inline mr-1" />
      {text}
    </motion.div>
  );
};

export function MoodChanger({ authToken, onStateChange }) { // MODIFIED: Added onStateChange prop
  // Global state fetched from /status
  const [currentMode, setCurrentMode] = useState('manual');
  const [currentState, setCurrentState] = useState('normal');
  const [manualState, setManualState] = useState('normal');
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. Fetch current status on mount and poll occasionally
  const fetchStatus = useCallback(async () => {
    try {
      // NOTE: FastAPI /status does NOT require a JWT, based on your code
      const response = await axios.get(`${FAST_API_URL}/status`);
      setCurrentMode(response.data.mode);
      setCurrentState(response.data.state);
      // Keep manual state in sync if mode is manual
      if (response.data.mode === 'manual') {
          setManualState(response.data.state);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchStatus]);

  // 2. Handler to switch the control mode (Manual/Auto)
  const handleModeChange = async (newMode) => {
    try {
      const formData = new URLSearchParams();
      formData.append('new_mode', newMode);

      await axios.post(`${FAST_API_URL}/mode`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setCurrentMode(newMode);
      setIsOpen(false);
      // Immediately fetch status to get the current AI-set state if switching to 'auto'
      fetchStatus(); 
    } catch (error) {
      console.error("Failed to change mode:", error);
    }
  };

  // The TopRightStateControl will use 'manualState' to set the state in the /chat call
  const handleManualStateChange = (state) => {
    setManualState(state);
    // MODIFIED: Notify the parent component of the manual state change
    if (onStateChange) onStateChange(state);
  };
  
  // NOTE: In a real app, when in 'manual' mode, you'd likely update the FastAPI 
  // state directly for consistency, but for now, we'll rely on the user passing
  // the 'state' in the /chat POST request payload, as per your FastAPI code.

  return (
    <div className="relative">
      <motion.button
        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Mood Changer Settings"
      >
        <Settings size={20} />
      </motion.button>
      
      <StateIndicator state={currentMode === 'auto' ? currentState : manualState} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-3 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h4 className="font-bold text-sm border-b pb-2 mb-2">Adaptive Control</h4>
            
            {/* Mode Toggle */}
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium flex items-center"><Zap size={16} className="mr-1 text-yellow-500" /> Mode:</span>
              <div className="flex gap-2">
                {CONTROL_MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`px-3 py-1 text-xs rounded-full transition ${currentMode === mode ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Manual State Selector */}
            {currentMode === 'manual' && (
              <div className="space-y-2 pt-2 border-t dark:border-gray-700">
                <p className="font-medium text-sm">Manual State:</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATES.map(state => (
                    <button
                      key={state}
                      onClick={() => handleManualStateChange(state)}
                      className={`py-1 text-xs rounded-lg transition ${manualState === state ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {state.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
