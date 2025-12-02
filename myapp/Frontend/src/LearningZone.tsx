import React, { useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LearningZoneProps {
  messages: Message[];
  onSend: (message: string) => void;
}

export default function LearningZone({ messages, onSend }: LearningZoneProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      const response = await axios.post<{ reply: string }>('http://localhost:5000/api/chat', {
        message,
        profile: 'normal', // Replace with dynamic profile if needed
        state: 'normal', // Replace with dynamic state if needed
      });
      onSend(response.data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      onSend('Error: Unable to connect to the chatbot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-green-500">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-2 rounded-lg bg-white/10 text-gray-200">
              Typing...
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-3 bg-white/10">
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (input.trim()) {
              onSend(input);
              sendMessage(input);
              setInput('');
            }
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 rounded-xl border bg-gray-100 text-black placeholder-gray-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
