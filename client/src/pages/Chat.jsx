import React, { useState } from 'react';
import { Send, User, Clock, AlertCircle } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: 'Hi! I love your Vintage Denim Jacket. Would you trade it for my Zara Trench Coat?', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Hey! That sounds like a fair trade. What condition is the trench coat in?', time: '10:35 AM' },
    { id: 3, sender: 'other', text: 'It is almost new, worn only twice. No stains or tears.', time: '10:38 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh] animate-fade-in-up">
      {/* Sidebar - Contacts / Active Swaps */}
      <div className="glass-card rounded-2xl p-4 flex flex-col h-full border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 px-2">Active Negotiations</h2>
        <div className="space-y-3 overflow-y-auto flex-grow pr-2 custom-scrollbar">
          <div className="p-3 rounded-xl bg-white/5 border border-[var(--color-primary)] cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={20} className="text-gray-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Alex Johnson</h4>
                <p className="text-xs text-[var(--color-text-muted)] truncate">Vintage Denim Jacket ↔ Zara Coat</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 rounded-xl bg-transparent border border-transparent hover:bg-white/5 transition-colors cursor-pointer opacity-70">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={20} className="text-gray-300" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Sam Smith</h4>
                <p className="text-xs text-[var(--color-text-muted)] truncate">Nike Sneakers ↔ Adidas Hoodie</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-2 glass-card rounded-2xl flex flex-col h-full border border-white/10">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center relative">
              <User size={20} className="text-gray-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-surface)]"></div>
            </div>
            <div>
              <h3 className="text-white font-bold">Alex Johnson</h3>
              <p className="text-xs text-green-400 flex items-center"><Clock size={10} className="mr-1"/> Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors border border-red-500/30">
              Reject Swap
            </button>
            <button className="px-4 py-2 btn-primary rounded-lg text-sm font-semibold shadow-lg">
              Confirm Swap
            </button>
          </div>
        </div>

        {/* Swap Info Banner */}
        <div className="bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/30 p-3 flex justify-between items-center text-sm">
          <div className="flex items-center text-[var(--color-text)]">
            <AlertCircle size={16} className="text-[var(--color-primary)] mr-2" />
            <span>Value Match: <span className="font-bold text-white">95%</span> (Fair Trade)</span>
          </div>
          <span className="text-[var(--color-text-muted)] text-xs">Estimated Value: $45 ↔ $50</span>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
          <form onSubmit={handleSend} className="flex space-x-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-grow bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button 
              type="submit" 
              className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
