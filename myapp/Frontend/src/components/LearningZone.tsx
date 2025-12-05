import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Camera, Brain, Wind, Gamepad2, BookOpen, Lightbulb, HelpCircle, Mic, Square, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { CognitiveState, UserType, ThemeMode } from '../App';
import { MiniQuizModal } from './interventions/MiniQuizModal';
import { DeeperDiveModal } from './interventions/DeeperDiveModal';
import { AnalogyCreatorModal } from './interventions/AnalogyCreatorModal';
import { BreathingExerciseModal } from './interventions/BreathingExerciseModal';
import { MiniGameModal } from './interventions/MiniGameModal';

interface LearningZoneProps {
  cognitiveState: CognitiveState;
  setCognitiveState: (state: CognitiveState) => void;
  userType: UserType;
  userId: string;
  addXP: (amount: number) => void;
  themeMode: ThemeMode;
  historyOpen: boolean;
  onOpenHistory: () => void;
  onCloseHistory: () => void;
}

export function LearningZone({ cognitiveState, setCognitiveState, userType, addXP, themeMode, userId, historyOpen, onOpenHistory, onCloseHistory }: LearningZoneProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m BrainBuddy, your adaptive learning companion. What would you like to learn today?' }
  ]);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const musicTracks = [
    '/ambient-music-1.mp3',
    '/ambient-music-2.mp3',
    '/ambient-music-3.mp3',
    '/ambient-music-4.mp3',
    '/ambient-music-5.mp3',
  ];

  // Handle ambient music toggle
  const handleAmbientMusicToggle = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        audioRef.current.play().catch(() => {
          alert('Could not play audio. Make sure you have audio files set up.');
        });
        setIsPlayingMusic(true);
      }
    }
  };

  // Handle track ending - move to next track
  const handleTrackEnd = () => {
    const nextIndex = (currentTrackIndex + 1) % musicTracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  // Cleanup audio on unmount and attach ended listener
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      if (el) {
        el.removeEventListener('ended', handleTrackEnd);
        el.pause();
      }
    };
  }, []);

  // Persist chat sessions per userId (new session each load/login)
  useEffect(() => {
    const key = `chat-sessions:${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const sessions = JSON.parse(saved) as Array<{ id: string; createdAt: number; messages: any[] }>;
        const latest = sessions[sessions.length - 1];
        if (latest) {
          setChatHistory(latest.messages || chatHistory);
          setSelectedSessionId(latest.id);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const key = `chat-sessions:${userId}`;
    try {
      const saved = localStorage.getItem(key);
      let sessions: Array<{ id: string; createdAt: number; messages: any[] }> = saved ? JSON.parse(saved) : [];
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx >= 0) {
        sessions[idx] = { ...sessions[idx], messages: chatHistory };
      } else {
        sessions.push({ id: sessionId, createdAt: Date.now(), messages: chatHistory });
      }
      sessions = sessions.slice(-20);
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch {}
  }, [chatHistory, userId, sessionId]);

  // When the currentTrackIndex changes, update the audio src and play if currently playing
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = musicTracks[currentTrackIndex];
    audioRef.current.load();
    if (isPlayingMusic) {
      audioRef.current.play().catch(() => {
        console.error('Could not autoplay next track');
      });
    }
  }, [currentTrackIndex]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessageToBackend(transcript); // Send the transcript to the backend
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);


  // --- Backend Communication Handlers ---

  // 1. Send a text message to the backend
  const sendMessageToBackend = async (msg: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setMessage('');
    const ctrl = new AbortController();
    setAbortCtrl(ctrl); setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          profile: userType,
          state: cognitiveState,
          userId,
          history: chatHistory.slice(-10),
        }),
        signal: ctrl.signal
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply || '(No response)' }]);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error contacting backend.' }]);
    } finally {
      setIsProcessing(false); setAbortCtrl(null);
    }
  };

  // 3. Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      setQueuedFiles(prev => [...prev, ...files]);
      setChatHistory(prev => [
        ...prev,
        ...files.map(f => ({ role: 'user' as const, content: `Selected file: ${f.name} (click Send to summarize)` }))
      ]);
    }
    // allow re-select same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setChatHistory(prev => [...prev, { role: 'user', content: `Uploading and summarizing file: ${file.name}` }]);

    try {
      const ctrl = new AbortController();
      setAbortCtrl(ctrl); setIsProcessing(true);
      const res = await fetch('http://localhost:4000/api/upload-file', {
        method: 'POST',
        body: formData,
        signal: ctrl.signal,
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: `**Summary from ${file.name}:**\n${data.summary}` }]);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error uploading or processing the file.' }]);
    } finally {
      setIsProcessing(false); setAbortCtrl(null);
    }
  };

  // 4. Handle camera snapshot
  const handleCameraToggle = async () => {
    if (isCameraOpen) {
      // Turn off camera
      const stream = cameraVideoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        setIsCameraOpen(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access the camera. Please ensure you have a webcam enabled and have granted permission.");
      }
    }
  };

  const handleSnapshot = async () => {
    if (cameraVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = cameraVideoRef.current.videoWidth;
      canvas.height = cameraVideoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(cameraVideoRef.current, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg');
        
        setChatHistory(prev => [...prev, { role: 'user', content: 'Processing snapshot...' }]);
        try {
          const ctrl = new AbortController();
          setAbortCtrl(ctrl); setIsProcessing(true);
          const res = await fetch('http://localhost:4000/api/upload-snapshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 }),
            signal: ctrl.signal,
          });
          const data = await res.json();
          setChatHistory(prev => [...prev, { role: 'assistant', content: `**Summary from snapshot:**\n${data.summary}` }]);
        } catch (err) {
          if ((err as any)?.name === 'AbortError') return;
          setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error processing the snapshot.' }]);
        } finally {
          handleCameraToggle(); // Turn off camera after snapshot
          setIsProcessing(false); setAbortCtrl(null);
        }
      }
    }
  };

  // 5. Handle Voice Input
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (error) {
          console.error("Could not start speech recognition:", error);
          setIsRecording(false);
        }
      }
    } else {
      alert("Sorry, your browser does not support voice recognition.");
    }
  };


  const stateThemes = {
    attention: {
      bg:
        themeMode === 'dynamic'
          ? 'from-blue-950 via-gray-900 to-green-950'
          : themeMode === 'light'
            ? 'from-blue-50 via-gray-50 to-green-50'
            : 'from-blue-950 via-gray-900 to-green-950',
      accent: 'from-blue-500 to-green-500',
      glow: 'shadow-blue-500/20',
      border: themeMode === 'light' ? 'border-blue-300' : 'border-blue-500/30',
    },
    calm: {
      bg: themeMode === 'dynamic'
        ? 'from-amber-950 via-gray-900 to-yellow-950'
        : themeMode === 'light'
          ? 'from-amber-50 via-gray-50 to-yellow-50'
          : 'from-amber-950 via-gray-900 to-yellow-950',
      accent: 'from-amber-500 to-yellow-500',
      glow: 'shadow-amber-500/20',
      border: themeMode === 'light' ? 'border-amber-300' : 'border-amber-500/30',
    },
    drowsiness: {
      bg: themeMode === 'dynamic'
        ? 'from-orange-950 via-gray-900 to-red-950'
        : themeMode === 'light'
          ? 'from-orange-50 via-gray-50 to-red-50'
          : 'from-orange-950 via-gray-900 to-red-950',
      accent: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/20',
      border: themeMode === 'light' ? 'border-orange-300' : 'border-orange-500/30',
    },
  };

  const theme = stateThemes[cognitiveState];

  const uploadAllQueued = async () => {
    for (const f of queuedFiles) {
      await uploadFile(f);
    }
    setQueuedFiles([]);
  };

  const handleSendMessage = async () => {
    if (isProcessing) return;
    const trimmed = message.trim();

    if (queuedFiles.length && !trimmed) {
      await uploadAllQueued();
      return;
    }

    if (queuedFiles.length && trimmed) {
      await uploadAllQueued();
      await sendMessageToBackend(trimmed);
      return;
    }

    if (trimmed) {
      await sendMessageToBackend(trimmed);
    }
  };

  const interventions = {
    attention: [
      {
        id: 'mini-quiz',
        icon: HelpCircle,
        label: 'Take Mini Quiz',
        description: 'Test your understanding',
        color: 'from-blue-600 to-cyan-600',
      },
      {
        id: 'deeper-dive',
        icon: BookOpen,
        label: 'Deeper Dive',
        description: 'Explore this topic further',
        color: 'from-green-600 to-teal-600',
      },
    ],
    calm: [
      {
        id: 'analogy-creator',
        icon: Lightbulb,
        label: 'Analogy Creator',
        description: 'Make connections',
        color: 'from-amber-600 to-yellow-600',
      },
    ],
    drowsiness: [
      {
        id: 'ambient-music',
        icon: Wind,
        label: isPlayingMusic ? 'Stop Ambient Music' : 'Start Ambient Music',
        description: 'Focus with calming sounds',
        color: 'from-orange-600 to-pink-600',
      },
      {
        id: 'breathing-exercise',
        icon: Wind,
        label: 'Breathing Exercise',
        description: 'Re-energize yourself',
        color: 'from-red-600 to-orange-600',
      },
      {
        id: 'mini-game',
        icon: Gamepad2,
        label: 'Start Mini-Game',
        description: 'Quick mental boost',
        color: 'from-purple-600 to-red-600',
      },
    ],
  };

  return (
    <motion.div
      key={cognitiveState}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-full bg-gradient-to-br ${theme.bg} p-6`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* State Control Panel */}
        <div className={`${themeMode === 'light' ? 'bg-white/90' : 'bg-white/5'
          } backdrop-blur-xl border ${theme.border} rounded-2xl p-6 shadow-2xl ${theme.glow}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className={`w-8 h-8 ${themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
              <h2 className={themeMode === 'light' ? 'text-black' : 'text-white'}>Cognitive State</h2>
            </div>
            <div className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {userType === 'adhd' ? 'ADHD Optimized' : 'Standard Mode'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['attention', 'calm', 'drowsiness'] as CognitiveState[]).map((state) => (
              <motion.button
                key={state}
                onClick={() => setCognitiveState(state)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-4 rounded-xl border-2 transition-all capitalize ${cognitiveState === state
                  ? `bg-gradient-to-r ${stateThemes[state].accent} border-white/30 shadow-lg text-white`
                  : themeMode === 'light'
                    ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
              >
                {state}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Intervention Buttons */}
        <div className="flex-shrink-0">
          <h3 className={`mb-3 px-6 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Recommended Interventions</h3>
          <div className="flex space-x-3 overflow-x-auto pb-4 px-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {interventions[cognitiveState].map((intervention) => {
              const Icon = intervention.icon;
              return (
                <motion.button
                  key={intervention.id}
                  onClick={() => {
                    if (intervention.id === 'ambient-music') {
                      handleAmbientMusicToggle();
                    } else {
                      setActiveModal(intervention.id);
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${intervention.color} text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{intervention.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`${themeMode === 'light' ? 'bg-white/90' : 'bg-white/5'
          } backdrop-blur-xl border ${theme.border} rounded-2xl shadow-2xl ${theme.glow} flex flex-col h-[500px]`}>
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                      ? `bg-gradient-to-r ${theme.accent} text-white`
                      : themeMode === 'light'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white/10 text-gray-200'
                      }`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        children={msg.content}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                        components={{
                          a: ({ node, ...props }: any) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline" />
                          ),
                          code: ({ node, inline, className, children, ...props }: any) => {
                            if (inline) return <code className="bg-white/5 px-1 rounded" {...props}>{children}</code>;
                            return (
                              <pre className="rounded bg-gray-900 p-3 overflow-auto"><code className={className} {...props}>{children}</code></pre>
                            );
                          },
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {isCameraOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-black/20 rounded-xl">
                  <video ref={cameraVideoRef} autoPlay className="w-full rounded-lg" />
                  <Button onClick={handleSnapshot} className="w-full mt-2 bg-purple-600 hover:bg-purple-700">Take Snapshot</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {historyOpen && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-start justify-start">
              <div className={`mt-8 ml-6 w-[360px] max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl ${themeMode === 'light' ? 'bg-white' : 'bg-gray-900 text-white'}`}>
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                  <h3 className="text-md font-semibold">Chat History</h3>
                  <Button variant="ghost" size="sm" onClick={onCloseHistory}>Close</Button>
                </div>
                <div className="flex h-[65vh]">
                  <div className="w-40 border-r border-white/10 overflow-y-auto p-3 space-y-2">
                    {(() => {
                      const key = `chat-sessions:${userId}`;
                      const saved = localStorage.getItem(key);
                      const sessions = saved ? JSON.parse(saved) as Array<{id:string;createdAt:number;messages:any[]}> : [];
                      return sessions.map(sess => (
                        <button
                          key={sess.id}
                          onClick={() => setSelectedSessionId(sess.id)}
                          className={`w-full text-left text-sm px-2 py-2 rounded ${selectedSessionId === sess.id ? 'bg-purple-600 text-white' : (themeMode === 'light' ? 'bg-gray-100' : 'bg-white/5 text-gray-100')}`}
                        >
                          {new Date(sess.createdAt).toLocaleString()}
                        </button>
                      ));
                    })()}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {(() => {
                      const key = `chat-sessions:${userId}`;
                      const saved = localStorage.getItem(key);
                      const sessions = saved ? JSON.parse(saved) as Array<{id:string;createdAt:number;messages:any[]}> : [];
                      const target = sessions.find(s => s.id === selectedSessionId) || sessions[sessions.length -1];
                      const msgs = target?.messages || [];
                      return msgs.map((msg: any, idx: number) => (
                        <div key={`history-${idx}`} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-purple-500 text-white' : (themeMode === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-white/10 text-gray-100')}`}>
                            <strong className="mr-2">{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className={`border-t p-4 ${themeMode === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className={themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}
                >
                  <Paperclip className="w-6 h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCameraToggle}
                  disabled={isProcessing}
                  className={`${isCameraOpen ? 'text-purple-400' : (themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
                >
                  <Camera className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenHistory}
                  className={themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white'}
                  title="View chat history"
                  aria-label="View chat history"
                >
                  <MessageSquare className="w-6 h-6" />
                </Button>
              </div>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                disabled={isProcessing}
                className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${themeMode === 'light'
                  ? 'bg-gray-100 border-gray-300 text-black placeholder-gray-500'
                  : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
              />

              <Button
                onClick={handleVoiceInput}
                variant="ghost"
                size="icon"
                disabled={isProcessing}
                className={isRecording ? 'text-red-500 animate-pulse' : (themeMode === 'light' ? 'text-gray-600 hover:text-black' : 'text-gray-400 hover:text-white')}
              >
                <Mic className="w-6 h-6" />
              </Button>
              {isProcessing ? (
                <Button
                  onClick={() => {
                    try { abortCtrl?.abort(); } catch {}
                    setIsProcessing(false); setAbortCtrl(null);
                    setChatHistory(prev => [...prev, { role: 'assistant', content: 'Stopped.' }]);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                  aria-label="Stop"
                  title="Stop"
                >
                  <Square className="w-6 h-6" />
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  className={`bg-gradient-to-r ${theme.accent} hover:opacity-90 text-white px-6`}
                >
                  <Send className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MiniQuizModal
        isOpen={activeModal === 'mini-quiz'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <DeeperDiveModal
        isOpen={activeModal === 'deeper-dive'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <AnalogyCreatorModal
        isOpen={activeModal === 'analogy-creator'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <BreathingExerciseModal
        isOpen={activeModal === 'breathing-exercise'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      <MiniGameModal
        isOpen={activeModal === 'mini-game'}
        onClose={() => setActiveModal(null)}
        addXP={addXP}
      />
      {/* Hidden audio element for ambient music */}
      <audio
        ref={audioRef}
        src={musicTracks[currentTrackIndex]}
        style={{ position: 'absolute', left: -9999, width: 0, height: 0 }}
        onEnded={handleTrackEnd}
      />
    </motion.div>
  );
}
