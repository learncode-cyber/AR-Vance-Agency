'use client';

import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export function AgentsChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      text: 'হাই! 👋 আমরা আপনাকে সাহায্য করতে প্রস্তুত। আপনি কি চান?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const agents = [
    { name: 'Lead Intelligence', icon: '🎯' },
    { name: 'Content Generator', icon: '✍️' },
    { name: 'Sales Assistant', icon: '📞' },
    { name: 'Analytics', icon: '📊' },
    { name: 'SEO Expert', icon: '🔍' },
    { name: 'Support', icon: '💬' },
  ];

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: 'আপনার অনুরোধ প্রসেস করছি... ✨',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-navy-500 to-gold-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl z-40 hover:scale-110"
        title="Open Agents Chat"
      >
        💬
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-[500px] animate-slideUp">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-500 to-gold-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">AI Agents</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl hover:scale-125 transition"
            >
              ✕
            </button>
          </div>

          {/* Agent Selection Tabs */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <div className="flex gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.name}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full text-sm font-medium text-navy-900 dark:text-white hover:bg-navy-50 dark:hover:bg-slate-600 transition whitespace-nowrap"
                >
                  {agent.icon} {agent.name}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-navy-500 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-navy-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="বার্তা লিখুন..."
              className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition text-sm font-medium"
            >
              পাঠাও
            </button>
          </div>
        </div>
      )}
    </>
  );
}
