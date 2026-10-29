import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  User, 
  Clock, 
  MapPin, 
  Calendar, 
  Phone, 
  Video, 
  ShieldCheck, 
  ArrowRightLeft, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExchangeDetailsModal from '../components/ExchangeDetailsModal';
import CallVerificationModal from '../components/CallVerificationModal';

const QUICK_REPLIES = [
  "Hi! I'm ready to coordinate the clothes swap.",
  "Let's do a quick video call to verify the item and identity.",
  "What time works best for you to meet at the location?",
  "I have arrived at the exchange spot!",
  "Please bring the garment cleaned and folded."
];

const Chat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const swapIdParam = searchParams.get('swapId');

  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Modals state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [callModalData, setCallModalData] = useState({
    isOpen: false,
    callType: 'video'
  });

  const messagesEndRef = useRef(null);

  // Fetch all user's swaps
  const fetchSwaps = async (selectId = null) => {
    try {
      const res = await api.get('/swaps');
      const allSwaps = res.data;
      setSwaps(allSwaps);

      if (allSwaps.length > 0) {
        let active = null;
        if (selectId) {
          active = allSwaps.find(s => s._id === selectId);
        } else if (swapIdParam) {
          active = allSwaps.find(s => s._id === swapIdParam);
        }
        if (!active) {
          active = allSwaps[0];
        }
        setSelectedSwap(active);
        if (active && (!swapIdParam || swapIdParam !== active._id)) {
          setSearchParams({ swapId: active._id }, { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps(swapIdParam);
  }, []);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedSwap?._id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/swaps/${selectedSwap._id}`);
        setSelectedSwap(res.data);
      } catch (e) {
        // quiet error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSwap?._id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSwap?.chatMessages]);

  const handleSelectSwap = (swap) => {
    setSelectedSwap(swap);
    setSearchParams({ swapId: swap._id });
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMessage;
    if (!textToSend.trim() || !selectedSwap?._id || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/swaps/${selectedSwap._id}/chat`, {
        message: textToSend,
        messageType: 'text'
      });
      setSelectedSwap(res.data);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartCall = (callType = 'video') => {
    setCallModalData({
      isOpen: true,
      callType
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading negotiations and chat...</p>
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto glass-card rounded-3xl p-12 text-center space-y-5 border border-white/10 my-10 animate-fade-in-up">
        <ArrowRightLeft size={48} className="mx-auto text-emerald-400" />
        <h2 className="text-2xl font-extrabold text-white">No Active Clothing Exchanges</h2>
        <p className="text-gray-400 text-sm">
          You don't have any clothing swap requests yet. Request an exchange on any wardrobe item to start messaging, view meetup maps, and verify partners via video call!
        </p>
        <button
          onClick={() => navigate('/listings')}
          className="btn-primary px-6 py-3 rounded-2xl text-sm font-bold shadow-xl"
        >
          Browse Wardrobe Listings
        </button>
      </div>
    );
  }

  const isReceiver = selectedSwap?.receiver?._id === user?._id;
  const partner = isReceiver ? selectedSwap?.requester : selectedSwap?.receiver;
  const isVerified = selectedSwap?.verification?.receiverVerified || selectedSwap?.verification?.requesterVerified;
  const verificationPin = selectedSwap?.verification?.verificationCode || '4829';

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[84vh] animate-fade-in-up py-2">
      
      {/* Left Sidebar: Active Swaps & Contacts */}
      <div className="lg:col-span-4 glass-card rounded-3xl p-4 flex flex-col h-full border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
          <h2 className="text-lg font-extrabold text-white flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span>
            <span>Active Exchanges</span>
          </h2>
          <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-gray-300 font-bold">
            {swaps.length}
          </span>
        </div>

        {/* Conversation List */}
        <div className="space-y-2.5 overflow-y-auto flex-grow mt-3 pr-1 custom-scrollbar">
          {swaps.map(swap => {
            const isRec = swap.receiver?._id === user?._id;
            const p = isRec ? swap.requester : swap.receiver;
            const isSelected = selectedSwap?._id === swap._id;
            const pVerified = swap.verification?.receiverVerified || swap.verification?.requesterVerified;
            const lastMsg = swap.chatMessages && swap.chatMessages.length > 0 
              ? swap.chatMessages[swap.chatMessages.length - 1] 
              : null;

            return (
              <div
                key={swap._id}
                onClick={() => handleSelectSwap(swap)}
                className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500/60 shadow-lg' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                      {p?.name ? p.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {pVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-slate-900" title="Identity Verified">
                        <ShieldCheck size={12} />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-white font-bold text-sm truncate">{p?.name || 'Swap Partner'}</h4>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        swap.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {swap.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 truncate">
                      {swap.offeredItem?.title} ⇄ {swap.requestedItem?.title}
                    </p>

                    <p className="text-[10px] text-gray-400 truncate mt-1">
                      {lastMsg ? lastMsg.message : `Meetup: ${swap.meetupLocation?.address || 'Scheduled'}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat & Exchange Negotiation Panel */}
      <div className="lg:col-span-8 glass-card rounded-3xl flex flex-col h-full border border-white/10 overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-extrabold text-base">{partner?.name || 'Partner'}</h3>
                {isVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center">
                    <ShieldCheck size={12} className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 flex items-center mt-0.5">
                <MapPin size={11} className="mr-1 text-emerald-400" />
                <span>{partner?.location || 'Local Community'}</span>
                <span className="mx-2">•</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons: Calling & Map */}
          <div className="flex items-center space-x-2">
            {/* View Location & Map Button */}
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center space-x-1.5 border border-white/10 transition-colors"
              title="Open Exchange Location & Map"
            >
              <MapPin size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Exchange Map</span>
            </button>

            {/* Voice Call Button */}
            <button
              type="button"
              onClick={() => handleStartCall('voice')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10 shadow-sm"
              title="Voice Call for Verification"
            >
              <Phone size={16} className="text-teal-400" />
            </button>

            {/* Video Call Button */}
            <button
              type="button"
              onClick={() => handleStartCall('video')}
              className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg"
              title="Video Call to Verify Person & Item"
            >
              <Video size={15} />
              <span>Verify via Call</span>
            </button>
          </div>
        </div>

        {/* Pinned Exchange Details Bar */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-gray-200 truncate">
            <ArrowRightLeft size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>{selectedSwap?.offeredItem?.title}</strong> ⇄ <strong>{selectedSwap?.requestedItem?.title}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-gray-300">
            <span className="flex items-center text-emerald-300">
              <MapPin size={12} className="mr-1" />
              <span className="truncate max-w-[160px] sm:max-w-none">
                {selectedSwap?.meetupLocation?.address || 'City Center'}
              </span>
            </span>

            <span className="bg-emerald-500/20 text-white font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              PIN: #{verificationPin}
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/40">
          {(!selectedSwap?.chatMessages || selectedSwap.chatMessages.length === 0) ? (
            <div className="text-center py-12 text-gray-400 text-xs space-y-2">
              <Sparkles size={28} className="mx-auto text-emerald-400 opacity-70" />
              <p className="font-semibold text-white">Start the Clothes Exchange Conversation</p>
              <p>Discuss clothing condition, confirm the meetup spot on the map, and verify identity!</p>
            </div>
          ) : (
            selectedSwap.chatMessages.map((msg, index) => {
              const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;

              // Render special system / verification messages
              if (msg.messageType === 'system' || msg.messageType === 'location-update') {
                return (
                  <div key={index} className="flex justify-center my-3 animate-fade-in">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs text-gray-300 flex items-center space-x-2 max-w-md text-center shadow-sm">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <span>{msg.message}</span>
                    </div>
                  </div>
                );
              }

              if (msg.messageType === 'verification-success') {
                return (
                  <div key={index} className="flex justify-center my-3 animate-fade-in">
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-xs text-emerald-300 flex items-center space-x-2 max-w-md shadow-lg">
                      <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Person Identity Verified ✓</p>
                        <p className="text-[11px] text-emerald-200/90">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.messageType === 'call-log') {
                return (
                  <div key={index} className="flex justify-center my-2 animate-fade-in">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-xs text-indigo-300 flex items-center space-x-2">
                      <PhoneCall size={13} className="text-indigo-400" />
                      <span>{msg.message}</span>
                    </div>
                  </div>
                );
              }

              // Standard User Chat Bubble
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-md ${
                    isMe 
                      ? 'btn-primary text-white rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/10'
                  }`}>
                    {!isMe && (
                      <p className="text-[10px] font-bold text-emerald-400 mb-1">{msg.senderName || partner?.name || 'Partner'}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs">
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(null, reply)}
              className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1 rounded-full whitespace-nowrap border border-white/10 transition-colors shrink-0"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${partner?.name || 'partner'} regarding meetup, exchange or details...`}
              className="flex-grow bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || sending}
              className="btn-primary w-11 h-11 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>

      {/* Exchange Details & Map Modal */}
      {isMapModalOpen && selectedSwap && (
        <ExchangeDetailsModal
          isOpen={isMapModalOpen}
          swap={selectedSwap}
          onClose={() => setIsMapModalOpen(false)}
          onSwapUpdated={(updated) => {
            setSelectedSwap(updated);
            fetchSwaps(updated._id);
          }}
          onOpenCall={(type) => {
            setIsMapModalOpen(false);
            handleStartCall(type);
          }}
        />
      )}

      {/* Video / Voice Call Modal */}
      {callModalData.isOpen && selectedSwap && (
        <CallVerificationModal
          isOpen={callModalData.isOpen}
          swap={selectedSwap}
          targetUser={partner}
          initialCallType={callModalData.callType}
          onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
          onVerificationSuccess={() => {
            fetchSwaps(selectedSwap._id);
          }}
        />
      )}

    </div>
  );
};

export default Chat;
