import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Tag, 
  ArrowRightLeft, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle,
  AlertCircle,
  X
} from 'lucide-react';
import ExchangeMap from '../components/ExchangeMap';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [selectedMyItemId, setSelectedMyItemId] = useState('');
  const [loading, setLoading] = useState(true);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Select item, 2: Map location & time, 3: Confirm
  const [submitting, setSubmitting] = useState(false);

  // Meetup Exchange State
  const [meetupLocation, setMeetupLocation] = useState({
    address: 'City Center Mall Public Plaza - Safe Exchange Zone',
    landmark: 'Ground Floor Info Desk / CCTV Zone',
    lat: 17.3297,
    lng: 76.8343,
    exchangeType: 'in-person'
  });
  const [meetupDate, setMeetupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [meetupTime, setMeetupTime] = useState('16:00');
  const [handoverNotes, setHandoverNotes] = useState('Will bring item in clean dust bag. Looking forward to verifying in person.');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/clothing/${id}`);
        setItem(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleOpenSwapModal = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.get('/clothing/user/me');
      const available = res.data.filter(i => i.status === 'available');
      setMyItems(available);
      if (available.length > 0) {
        setSelectedMyItemId(available[0]._id);
      }
      setModalStep(1);
      setSwapModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocationSelect = (loc) => {
    setMeetupLocation(prev => ({
      ...prev,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address
    }));
  };

  const handleRequestSwap = async () => {
    if (!selectedMyItemId) return alert('Please select an item to offer');
    setSubmitting(true);
    try {
      const res = await api.post('/swaps', {
        receiverId: item.user._id,
        offeredItemId: selectedMyItemId,
        requestedItemId: item._id,
        meetupLocation,
        meetupDate,
        meetupTime,
        handoverNotes,
        itemConditionCheck: 'Buyer agrees to inspect item before confirmation'
      });
      alert('Clothing exchange request submitted successfully! You can now chat and verify identity.');
      setSwapModalOpen(false);
      navigate(`/chat?swapId=${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Error sending swap request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading clothing details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <h2 className="text-2xl font-bold">Item not found</h2>
        <button onClick={() => navigate('/listings')} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">
          Browse Wardrobe
        </button>
      </div>
    );
  }

  const selectedItemObj = myItems.find(i => i._id === selectedMyItemId);
  const valueDiff = selectedItemObj ? selectedItemObj.estimatedValue - item.estimatedValue : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in-up">
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
        
        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-black/40 relative min-h-[420px] flex items-center justify-center overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop" }}
          />
          <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center space-x-1">
            <Sparkles size={14} />
            <span>{item.type}</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-300">Condition: <strong className="text-emerald-400 capitalize">{item.condition}</strong></span>
            <span className="text-gray-300">Size: <strong className="text-white">{item.size}</strong></span>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-1">
                {item.brand}
              </p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">{item.title}</h1>
            </div>

            <div className="flex flex-wrap gap-2.5 text-xs text-gray-300">
              <span className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Tag size={14} className="text-emerald-400" />
                <span>{item.brand}</span>
              </span>
              <span className="flex items-center space-x-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <MapPin size={14} className="text-indigo-400" />
                <span>{item.location || 'Local Exchange Zone'}</span>
              </span>
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-semibold">
                Size: <span className="text-emerald-400">{item.size}</span>
              </span>
            </div>

            <div className="py-4 border-y border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-gray-200">Garment Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {item.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <p className="text-xs text-gray-400">Estimated Wardrobe Value</p>
                <p className="text-3xl font-black text-emerald-400">${item.estimatedValue}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Listed by Wardrobe Owner</p>
                <p className="font-bold text-white text-base">{item.user?.name}</p>
                <p className="text-[11px] text-gray-400">{item.user?.location || 'Verified Member'}</p>
              </div>
            </div>

            {/* Exchange Security Guarantee */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-emerald-200">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Safe Exchange & Verification Guaranteed</p>
                <p className="text-emerald-300/80 text-[11px] mt-0.5">
                  Coordinate in-person exchange on the live map and verify the partner via voice or video call.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {user?._id === item.user?._id ? (
              <button disabled className="w-full bg-white/10 text-gray-400 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed border border-white/5">
                This is your listing
              </button>
            ) : (
              <>
                <button 
                  onClick={handleOpenSwapModal} 
                  className="flex-1 btn-primary py-3.5 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <ArrowRightLeft size={20} />
                  <span>Request Clothing Exchange</span>
                </button>
                <button 
                  onClick={() => navigate('/chat')} 
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center space-x-2 border border-white/10 transition-colors"
                  title="Direct Message"
                >
                  <MessageCircle size={18} />
                  <span>Chat</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Propose Clothing Exchange Multi-Step Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                  <ArrowRightLeft className="text-emerald-400" size={24} />
                  <span>Propose Clothes Exchange</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Step {modalStep} of 2: {modalStep === 1 ? 'Select Your Offer' : 'Exchange Location & Meetup Details'}
                </p>
              </div>
              <button 
                onClick={() => setSwapModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* STEP 1: Select Offered Item */}
            {modalStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <p className="text-sm text-gray-300 mb-3">
                    Select an item from your wardrobe to offer in exchange for <strong>{item.title}</strong> (Est. ${item.estimatedValue}):
                  </p>

                  {myItems.length === 0 ? (
                    <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <AlertCircle size={36} className="mx-auto text-amber-400" />
                      <div>
                        <h4 className="font-bold text-white text-base">Your Wardrobe is Empty</h4>
                        <p className="text-xs text-gray-400 mt-1">You must list at least one clothing item before requesting an exchange.</p>
                      </div>
                      <button 
                        onClick={() => navigate('/listings/new')} 
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg"
                      >
                        Add Clothes to Wardrobe
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                      {myItems.map(myItem => {
                        const isSelected = selectedMyItemId === myItem._id;
                        return (
                          <div
                            key={myItem._id}
                            onClick={() => setSelectedMyItemId(myItem._id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                              isSelected 
                                ? 'bg-emerald-500/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/30' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <img 
                              src={myItem.imageUrl} 
                              alt={myItem.title} 
                              className="w-14 h-14 object-cover rounded-xl bg-slate-800 border border-white/10 shrink-0"
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=200&auto=format&fit=crop" }}
                            />
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-white text-sm truncate">{myItem.title}</p>
                              <p className="text-xs text-gray-400">{myItem.brand} • Size {myItem.size}</p>
                              <p className="text-xs font-extrabold text-emerald-400 mt-0.5">${myItem.estimatedValue}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Trade Balance meter */}
                {selectedItemObj && (
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-gray-400">Your Offer: <strong className="text-white">${selectedItemObj.estimatedValue}</strong></p>
                      <p className="text-gray-400">Target Item: <strong className="text-white">${item.estimatedValue}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        Math.abs(valueDiff) < 15 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {Math.abs(valueDiff) < 15 ? 'Fair 1:1 Trade' : valueDiff > 0 ? `+${valueDiff} Higher Value` : `${Math.abs(valueDiff)} Lower Value`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSwapModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setModalStep(2)}
                    disabled={!selectedMyItemId}
                    className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>Next: Set Meetup Location</span>
                    <MapPin size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Map Location & Exchange Details */}
            {modalStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* Interactive Leaflet Map for Location Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    1. Choose Physical Meetup Spot on Map
                  </label>
                  <ExchangeMap 
                    lat={meetupLocation.lat} 
                    lng={meetupLocation.lng} 
                    address={meetupLocation.address}
                    isEditable={true}
                    onLocationSelect={handleLocationSelect}
                    height="260px"
                  />
                </div>

                {/* Exchange Venue & Timing Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center">
                      <MapPin size={14} className="text-emerald-400 mr-1" />
                      Venue / Spot Name
                    </label>
                    <input 
                      type="text" 
                      value={meetupLocation.address} 
                      onChange={(e) => setMeetupLocation(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                      placeholder="e.g. City Mall Main Lobby"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center">
                      <Clock size={14} className="text-indigo-400 mr-1" />
                      Specific Landmark Note
                    </label>
                    <input 
                      type="text" 
                      value={meetupLocation.landmark} 
                      onChange={(e) => setMeetupLocation(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                      placeholder="e.g. Beside Main Fountain / Info Desk"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center">
                      <Calendar size={14} className="text-amber-400 mr-1" />
                      Proposed Exchange Date
                    </label>
                    <input 
                      type="date" 
                      value={meetupDate} 
                      onChange={(e) => setMeetupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center">
                      <Clock size={14} className="text-emerald-400 mr-1" />
                      Proposed Exchange Time
                    </label>
                    <input 
                      type="time" 
                      value={meetupTime} 
                      onChange={(e) => setMeetupTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Handover Notes & Instructions for Owner
                  </label>
                  <textarea 
                    rows={2} 
                    value={handoverNotes} 
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                    placeholder="e.g. I will carry the jacket in a blue tote bag. Can do a quick video call before meeting."
                  />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-gray-300 flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <span>
                    A secure <strong>4-digit verification code</strong> will be generated. You can also video call the owner directly in chat to verify their identity!
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setModalStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15"
                  >
                    Back to Items
                  </button>
                  <button 
                    type="button" 
                    onClick={handleRequestSwap}
                    disabled={submitting}
                    className="btn-primary px-7 py-2.5 rounded-xl font-bold text-sm shadow-xl flex items-center space-x-2"
                  >
                    <Sparkles size={16} />
                    <span>{submitting ? 'Sending Request...' : 'Send Exchange Request'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
