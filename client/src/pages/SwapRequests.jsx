import { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Video, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ExchangeDetailsModal from '../components/ExchangeDetailsModal';
import CallVerificationModal from '../components/CallVerificationModal';

const SwapRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'incoming' | 'sent' | 'completed'

  // Modals state
  const [activeDetailsSwap, setActiveDetailsSwap] = useState(null);
  const [callModalData, setCallModalData] = useState({
    isOpen: false,
    swap: null,
    targetUser: null,
    callType: 'video'
  });

  const fetchSwaps = async () => {
    try {
      const res = await api.get('/swaps');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/swaps/${id}/status`, { status });
      fetchSwaps();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleOpenCall = (swap, callType = 'video') => {
    const isRequester = swap.requester?._id === user?._id;
    const targetUser = isRequester ? swap.receiver : swap.requester;
    setCallModalData({
      isOpen: true,
      swap,
      targetUser,
      callType
    });
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const isReceiver = req.receiver?._id === user?._id;
    if (filter === 'incoming') return isReceiver && req.status !== 'completed';
    if (filter === 'sent') return !isReceiver && req.status !== 'completed';
    if (filter === 'completed') return req.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center">
            <ArrowRightLeft className="mr-3 text-emerald-400" size={32} />
            Clothing Exchange & Swaps
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track clothing requests, schedule physical exchange spots, and verify partners via video call.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 text-xs font-bold">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'all' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            All ({requests.length})
          </button>
          <button 
            onClick={() => setFilter('incoming')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'incoming' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Incoming
          </button>
          <button 
            onClick={() => setFilter('sent')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'sent' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Sent
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'completed' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading clothing exchange requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-white/10">
          <ArrowRightLeft size={44} className="mx-auto text-gray-500" />
          <h3 className="text-xl font-bold text-white">No Exchange Requests Found</h3>
          <p className="text-gray-400 text-xs max-w-md mx-auto">
            Browse wardrobe items from sustainable community members and propose an item swap to start an exchange!
          </p>
          <button 
            onClick={() => navigate('/listings')} 
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg"
          >
            Explore Wardrobes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(swap => {
            const isReceiver = swap.receiver?._id === user?._id;
            const partner = isReceiver ? swap.requester : swap.receiver;
            const isVerified = swap.verification?.receiverVerified || swap.verification?.requesterVerified;
            const statusBadge = swap.status === 'accepted' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : swap.status === 'completed'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : swap.status === 'rejected'
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

            return (
              <div 
                key={swap._id} 
                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all space-y-5"
              >
                {/* Header row: Partner info & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-md">
                      {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{partner?.name || 'Community Member'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                          {isReceiver ? 'Wants to swap with you' : 'You requested swap'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 flex items-center mt-0.5">
                        <MapPin size={12} className="mr-1 text-emerald-400" />
                        <span>{partner?.location || 'Local Member'}</span>
                        <span className="mx-2">•</span>
                        <Clock size={12} className="mr-1" />
                        <span>{new Date(swap.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Verification Status Tag */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                      isVerified 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <ShieldCheck size={14} />
                      <span>{isVerified ? 'Person Verified' : 'Unverified • Call to Verify'}</span>
                    </div>

                    {/* Swap Status */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadge}`}>
                      {swap.status}
                    </span>
                  </div>
                </div>

                {/* Exchange Items Box */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 p-4 rounded-2xl border border-white/5">
                  {/* Offered Item */}
                  <div className="flex items-start space-x-3">
                    <img 
                      src={swap.offeredItem?.imageUrl} 
                      alt={swap.offeredItem?.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop" }}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {isReceiver ? 'They Offer' : 'You Offer'}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-tight">{swap.offeredItem?.title}</h4>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-semibold">{swap.offeredItem?.type || 'Clothing'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">Size {swap.offeredItem?.size}</span>
                        {swap.offeredItem?.color && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold">{swap.offeredItem.color}</span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold">{swap.offeredItem?.condition}</span>
                      </div>
                      <p className="text-xs font-black text-emerald-400">₹{swap.offeredItem?.estimatedValue?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Arrow divider on desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">⇄</div>
                  </div>

                  {/* Requested Item */}
                  <div className="flex items-start space-x-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                    <img 
                      src={swap.requestedItem?.imageUrl} 
                      alt={swap.requestedItem?.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop" }}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {isReceiver ? 'Your Garment' : 'You Receive'}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-tight">{swap.requestedItem?.title}</h4>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-semibold">{swap.requestedItem?.type || 'Clothing'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold">Size {swap.requestedItem?.size}</span>
                        {swap.requestedItem?.color && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-semibold">{swap.requestedItem.color}</span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold">{swap.requestedItem?.condition}</span>
                      </div>
                      <p className="text-xs font-black text-indigo-400">₹{swap.requestedItem?.estimatedValue?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Meetup Details Snippet */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-white flex items-center space-x-1">
                        <span>Meetup:</span>
                        <span className="text-emerald-300 truncate">{swap.meetupLocation?.address || 'Central Mall Public Hub'}</span>
                      </span>
                      <p className="text-[11px] text-gray-400">
                        {swap.meetupDate ? `Date: ${swap.meetupDate}` : 'Date: TBD'} 
                        {swap.meetupTime ? ` at ${swap.meetupTime}` : ''} • Security PIN: #{swap.verification?.verificationCode || '4829'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDetailsSwap(swap)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-colors"
                  >
                    <span>View Map & Meetup Details</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {/* Left: Communication & Verification options */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/chat?swapId=${swap._id}`}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/10 transition-colors"
                    >
                      <MessageCircle size={14} className="text-emerald-400" />
                      <span>Message Chat</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenCall(swap, 'voice')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center space-x-1 border border-white/10 transition-colors"
                      title="Voice Verification Call"
                    >
                      <Phone size={14} className="text-teal-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCall(swap, 'video')}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
                      title="Video Identity Verification Call"
                    >
                      <Video size={14} className="text-indigo-400" />
                      <span>Verify via Video Call</span>
                    </button>
                  </div>

                  {/* Right: Decision Actions */}
                  <div className="flex items-center space-x-2">
                    {isReceiver && swap.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(swap._id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold text-xs flex items-center space-x-1 transition-colors"
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(swap._id, 'accepted')}
                          className="btn-primary px-5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md"
                        >
                          <Check size={14} />
                          <span>Accept Exchange</span>
                        </button>
                      </>
                    )}

                    {swap.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(swap._id, 'completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/30 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        <span>Confirm Swap Completed</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Exchange Details Modal */}
      {activeDetailsSwap && (
        <ExchangeDetailsModal
          isOpen={!!activeDetailsSwap}
          swap={activeDetailsSwap}
          onClose={() => setActiveDetailsSwap(null)}
          onSwapUpdated={(updated) => {
            setActiveDetailsSwap(updated);
            fetchSwaps();
          }}
          onOpenCall={(type) => {
            const current = activeDetailsSwap;
            setActiveDetailsSwap(null);
            handleOpenCall(current, type);
          }}
        />
      )}

      {/* Video / Voice Call Modal */}
      {callModalData.isOpen && (
        <CallVerificationModal
          isOpen={callModalData.isOpen}
          swap={callModalData.swap}
          targetUser={callModalData.targetUser}
          initialCallType={callModalData.callType}
          onClose={() => setCallModalData(prev => ({ ...prev, isOpen: false }))}
          onVerificationSuccess={() => {
            fetchSwaps();
          }}
        />
      )}
    </div>
  );
};

export default SwapRequests;
