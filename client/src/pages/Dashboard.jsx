import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MapPin, 
  Video, 
  ShieldCheck, 
  ExternalLink,
  Phone
} from 'lucide-react';
import ExchangeDetailsModal from '../components/ExchangeDetailsModal';
import CallVerificationModal from '../components/CallVerificationModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeDetailsSwap, setActiveDetailsSwap] = useState(null);
  const [callModalData, setCallModalData] = useState({
    isOpen: false,
    swap: null,
    targetUser: null,
    callType: 'video'
  });

  const fetchData = async () => {
    try {
      const [reqRes, itemsRes] = await Promise.all([
        api.get('/swaps'),
        api.get('/clothing/user/me')
      ]);
      setRequests(reqRes.data);
      setMyItems(itemsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/swaps/${id}/status`, { status });
      fetchData(); // refresh data
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/clothing/${id}`);
        fetchData(); // refresh data
      } catch (error) {
        console.error(error);
        alert('Failed to delete item');
      }
    }
  };

  const handleOpenCall = (swap, callType = 'video') => {
    const isReceiver = swap.receiver?._id === user?._id;
    const targetUser = isReceiver ? swap.requester : swap.receiver;
    setCallModalData({
      isOpen: true,
      swap,
      targetUser,
      callType
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading your wardrobe and swap requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 md:p-10 rounded-3xl text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <h1 className="text-3xl md:text-5xl font-black mb-2 relative z-10">Welcome, {user?.name}!</h1>
        <p className="text-white/80 font-medium relative z-10 text-base md:text-lg mb-4">
          Manage your circular wardrobe, coordinate physical exchange locations, and request size/color replacements on purchases.
        </p>
        <div className="flex flex-wrap gap-3 relative z-10">
          <Link 
            to="/orders" 
            className="bg-white text-slate-900 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl font-black text-xs flex items-center space-x-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span>📦 My Orders & Clothes Exchange Center</span>
          </Link>
          <Link 
            to="/requests" 
            className="bg-black/30 hover:bg-black/40 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 border border-white/20 transition-transform hover:scale-105"
          >
            <span>⇄ View Swap Requests ({requests.length})</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Swap Requests Section */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h2 className="text-2xl font-extrabold text-white">Swap Requests</h2>
              <Link to="/requests" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                View All ({requests.length})
              </Link>
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-gray-400 text-sm">No active swap requests yet.</p>
              ) : (
                requests.slice(0, 4).map(req => {
                  const isReceiver = req.receiver?._id === user?._id;
                  const partner = isReceiver ? req.requester : req.receiver;
                  const isVerified = req.verification?.receiverVerified || req.verification?.requesterVerified;
                  const statusColor = req.status === 'pending' ? 'text-amber-400 bg-amber-400/20 border border-amber-400/30' : 
                                      req.status === 'accepted' ? 'text-emerald-400 bg-emerald-400/20 border border-emerald-400/30' : 
                                      'text-red-400 bg-red-400/20 border border-red-400/30';

                  return (
                    <div key={req._id} className="border border-white/10 p-4 md:p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                              {isReceiver ? `From ${partner?.name || 'Member'}` : `To ${partner?.name || 'Member'}`}
                            </span>
                            {isVerified && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                <ShieldCheck size={11} className="mr-0.5" /> Verified
                              </span>
                            )}
                          </div>
                          <div className={`mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${statusColor}`}>
                            {req.status}
                          </div>
                        </div>

                        {/* Direct Actions: Call & Chat */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenCall(req, 'video')}
                            className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 p-2 rounded-xl transition-colors border border-indigo-500/20"
                            title="Verify via Video Call"
                          >
                            <Video size={16} />
                          </button>
                          <Link 
                            to={`/chat?swapId=${req._id}`} 
                            className="text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 p-2 rounded-xl transition-colors border border-emerald-500/20 shadow-sm" 
                            title="Open Chat"
                          >
                            <MessageCircle size={16} />
                          </Link>
                        </div>
                      </div>

                      {/* Items traded */}
                      <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5 text-xs">
                        <div className="w-5/12 text-center">
                          <p className="text-[10px] text-gray-400 mb-0.5 font-medium">{isReceiver ? 'They offer' : 'You offer'}</p>
                          <p className="font-bold text-white truncate">{req.offeredItem?.title}</p>
                          <p className="text-emerald-400 font-extrabold mt-0.5">${req.offeredItem?.estimatedValue}</p>
                        </div>
                        <div className="text-gray-400 font-black">⇄</div>
                        <div className="w-5/12 text-center">
                          <p className="text-[10px] text-gray-400 mb-0.5 font-medium">{isReceiver ? 'They want' : 'You receive'}</p>
                          <p className="font-bold text-white truncate">{req.requestedItem?.title}</p>
                          <p className="text-emerald-400 font-extrabold mt-0.5">${req.requestedItem?.estimatedValue}</p>
                        </div>
                      </div>

                      {/* Meetup location snippet */}
                      <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <div className="flex items-center space-x-1.5 truncate text-gray-300">
                          <MapPin size={13} className="text-emerald-400 shrink-0" />
                          <span className="truncate">{req.meetupLocation?.address || 'Central Exchange Hub'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveDetailsSwap(req)}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 shrink-0 ml-2"
                        >
                          View Map
                        </button>
                      </div>

                      {/* Accept/Reject Buttons */}
                      {isReceiver && req.status === 'pending' && (
                        <div className="flex space-x-2 pt-2 border-t border-white/10">
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'accepted')} 
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                          >
                            <CheckCircle size={15} /> <span>Accept</span>
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'rejected')} 
                            className="flex-1 flex items-center justify-center space-x-1.5 bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle size={15} /> <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* My Wardrobe Section */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h2 className="text-2xl font-extrabold text-white">My Wardrobe</h2>
              <Link 
                to="/listings/new" 
                className="text-xs font-bold btn-primary px-3.5 py-1.5 rounded-xl shadow-md"
              >
                Add Item +
              </Link>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {myItems.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <p className="text-gray-400 text-sm">Your wardrobe is empty.</p>
                  <Link to="/listings/new" className="inline-block btn-primary px-5 py-2 rounded-xl text-xs font-bold">
                    Add Your First Clothing Item
                  </Link>
                </div>
              ) : (
                myItems.map(item => (
                  <div key={item._id} className="flex items-center space-x-3.5 border border-white/10 p-3.5 rounded-2xl bg-white/5 relative group hover:bg-white/10 transition-colors">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-14 h-14 object-cover rounded-xl bg-black/40 border border-white/10 shrink-0" 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=200&auto=format&fit=crop" }} 
                    />
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-white text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.brand} • Size {item.size} • ${item.estimatedValue}</p>
                    </div>
                    <div className="text-right flex items-center space-x-2 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={() => handleDeleteItem(item._id)} 
                        className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-xl transition-colors opacity-80 hover:opacity-100" 
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Exchange Details Modal */}
      {activeDetailsSwap && (
        <ExchangeDetailsModal
          isOpen={!!activeDetailsSwap}
          swap={activeDetailsSwap}
          onClose={() => setActiveDetailsSwap(null)}
          onSwapUpdated={(updated) => {
            setActiveDetailsSwap(updated);
            fetchData();
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
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
