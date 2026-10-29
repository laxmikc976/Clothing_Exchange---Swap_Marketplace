import { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRightLeft, 
  FileText, 
  Video, 
  Phone, 
  Compass, 
  Edit3, 
  Save 
} from 'lucide-react';
import ExchangeMap from './ExchangeMap';
import api from '../utils/api';

const ExchangeDetailsModal = ({
  isOpen,
  onClose,
  swap,
  onSwapUpdated = null,
  onOpenCall = null
}) => {
  if (!isOpen || !swap) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(swap.meetupLocation?.address || 'Central Mall Public Plaza');
  const [landmark, setLandmark] = useState(swap.meetupLocation?.landmark || 'Main Information Desk');
  const [lat, setLat] = useState(swap.meetupLocation?.lat || 17.3297);
  const [lng, setLng] = useState(swap.meetupLocation?.lng || 76.8343);
  const [exchangeType, setExchangeType] = useState(swap.meetupLocation?.exchangeType || 'in-person');
  const [meetupDate, setMeetupDate] = useState(swap.meetupDate || '');
  const [meetupTime, setMeetupTime] = useState(swap.meetupTime || '');
  const [handoverNotes, setHandoverNotes] = useState(swap.handoverNotes || '');

  const handleLocationSelect = (loc) => {
    setLat(loc.lat);
    setLng(loc.lng);
    setAddress(loc.address);
  };

  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/swaps/${swap._id}/details`, {
        meetupLocation: {
          address,
          landmark,
          lat,
          lng,
          exchangeType
        },
        meetupDate,
        meetupTime,
        handoverNotes
      });
      setIsEditing(false);
      if (onSwapUpdated) onSwapUpdated(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update meetup details');
    } finally {
      setLoading(false);
    }
  };

  const isVerified = swap.verification?.receiverVerified || swap.verification?.requesterVerified;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <MapPin size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Clothes Exchange Location & Details</h2>
              <p className="text-xs text-gray-400">Mutual handover spot and safe verification details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">

          {/* Items In Exchange Banner */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Offered Item */}
            <div className="flex items-center space-x-3 w-full sm:w-5/12">
              <img 
                src={swap.offeredItem?.imageUrl} 
                alt={swap.offeredItem?.title}
                className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop" }}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Offered Item</span>
                <p className="font-bold text-white text-sm truncate">{swap.offeredItem?.title}</p>
                <p className="text-xs text-emerald-400 font-semibold">${swap.offeredItem?.estimatedValue} • Size {swap.offeredItem?.size}</p>
              </div>
            </div>

            {/* Swap Icon */}
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ArrowRightLeft size={18} />
            </div>

            {/* Requested Item */}
            <div className="flex items-center space-x-3 w-full sm:w-5/12 justify-start sm:justify-end text-left sm:text-right">
              <div className="min-w-0 order-2 sm:order-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requested Item</span>
                <p className="font-bold text-white text-sm truncate">{swap.requestedItem?.title}</p>
                <p className="text-xs text-emerald-400 font-semibold">${swap.requestedItem?.estimatedValue} • Size {swap.requestedItem?.size}</p>
              </div>
              <img 
                src={swap.requestedItem?.imageUrl} 
                alt={swap.requestedItem?.title}
                className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0 order-1 sm:order-2"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop" }}
              />
            </div>
          </div>

          {/* Interactive Map Component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center space-x-2">
                <MapPin size={16} className="text-emerald-400" />
                <span>Exchange Meetup Location on Map</span>
              </label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <Edit3 size={13} />
                  <span>Change Spot</span>
                </button>
              )}
            </div>

            <ExchangeMap 
              lat={lat} 
              lng={lng} 
              address={address} 
              isEditable={isEditing} 
              onLocationSelect={handleLocationSelect}
              height="280px"
            />
          </div>

          {/* Form Fields / Read-only Details */}
          {isEditing ? (
            <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Location / Venue Name</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Central Mall Ground Floor Plaza"
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Specific Landmark / Note</label>
                  <input 
                    type="text" 
                    value={landmark} 
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g., Near Entrance #2 or Coffee Shop"
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meetup Date</label>
                  <input 
                    type="date" 
                    value={meetupDate} 
                    onChange={(e) => setMeetupDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meetup Time</label>
                  <input 
                    type="time" 
                    value={meetupTime} 
                    onChange={(e) => setMeetupTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Handover Notes & Instructions</label>
                <textarea 
                  rows={2} 
                  value={handoverNotes} 
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Special instructions (e.g., will bring hanger and garment bag, inspect condition together)..."
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={loading}
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg"
                >
                  <Save size={14} />
                  <span>{loading ? 'Saving...' : 'Save Exchange Details'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-bold uppercase">Scheduled Date</span>
                </div>
                <p className="text-white font-semibold text-sm">{meetupDate || 'Pending agreement'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Agreed exchange date</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase">Scheduled Time</span>
                </div>
                <p className="text-white font-semibold text-sm">{meetupTime || 'TBD (Confirm in Chat)'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Daylight recommended</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <FileText size={16} />
                  <span className="text-xs font-bold uppercase">Security Token</span>
                </div>
                <p className="text-white font-mono font-black text-sm tracking-widest">
                  #{swap.verification?.verificationCode || '4829'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Read to confirm ownership</p>
              </div>
            </div>
          )}

          {/* Verification Status & Call Prompt */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                isVerified 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">Identity Verification</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isVerified ? 'Verified via Call ✓' : 'Verification Recommended'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Verify the correct person through a quick Voice/Video call before exchanging clothes.
                </p>
              </div>
            </div>

            {onOpenCall && (
              <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenCall('voice')}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/15"
                >
                  <Phone size={14} className="text-emerald-400" />
                  <span>Voice Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCall('video')}
                  className="flex-1 md:flex-none btn-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg"
                >
                  <Video size={14} />
                  <span>Video Call Verification</span>
                </button>
              </div>
            )}
          </div>

          {/* Safety Checklist for Physical Swap */}
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs space-y-2 text-gray-300">
            <p className="font-bold text-white flex items-center">
              <ShieldCheck size={14} className="text-emerald-400 mr-1.5" />
              Clothing Exchange Safety Rules
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400 text-[11px]">
              <li>Always meet in a well-lit, public location with cameras (e.g. inside mall plaza or metro station).</li>
              <li>Inspect seams, zippers, and fabric condition on-site before exchanging items.</li>
              <li>Check the 4-digit Security PIN on the app during meetup to guarantee you are with the registered user.</li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-white/10 flex justify-between items-center">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <Compass size={14} />
            <span>Open GPS Directions</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExchangeDetailsModal;
