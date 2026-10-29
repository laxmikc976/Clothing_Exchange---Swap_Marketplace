import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Star, 
  Send,
  Package,
  RotateCcw,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// 8 Primary Lifecycle Stages for the visual tracker
const TRACKING_STAGES = [
  { id: 'submitted', label: '1. Request Submitted', statuses: ['Request submitted'] },
  { id: 'review', label: '2. Under Review', statuses: ['Under review'] },
  { id: 'approved', label: '3. Approved', statuses: ['Approved'] },
  { id: 'pickup', label: '4. Pickup Scheduled', statuses: ['Pickup scheduled'] },
  { id: 'picked', label: '5. Item Picked Up', statuses: ['Item picked up', 'Quality check'] },
  { id: 'replacement', label: '6. Replacement Processing', statuses: ['Replacement processing'] },
  { id: 'shipped', label: '7. Dispatched / In Transit', statuses: ['Shipped', 'Out for delivery'] },
  { id: 'completed', label: '8. Delivered & Completed', statuses: ['Delivered', 'Completed'] }
];

const ExchangeTracking = () => {
  const { exchangeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const fetchExchange = async () => {
    try {
      const res = await api.get(`/exchanges/${exchangeId}`);
      setExchange(res.data);
      if (res.data.feedback?.rating) {
        setRating(res.data.feedback.rating);
        setFeedbackComment(res.data.feedback.comment || '');
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchange();
  }, [exchangeId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this clothes exchange request?')) return;
    setCancelling(true);
    try {
      await api.put(`/exchanges/${exchange._id}/cancel`);
      fetchExchange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/exchanges/${exchange._id}/feedback`, {
        rating,
        comment: feedbackComment
      });
      setFeedbackSubmitted(true);
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading live exchange tracking...</p>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <h2 className="text-2xl font-bold">Exchange Request Not Found</h2>
        <button onClick={() => navigate('/orders')} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">
          View My Orders
        </button>
      </div>
    );
  }

  // Calculate current stage index
  const getCurrentStageIndex = () => {
    if (exchange.status === 'Cancelled' || exchange.status === 'Rejected') return -1;
    for (let i = 0; i < TRACKING_STAGES.length; i++) {
      if (TRACKING_STAGES[i].statuses.includes(exchange.status)) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const isTerminated = exchange.status === 'Cancelled' || exchange.status === 'Rejected';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/orders"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">Track Clothes Exchange</h1>
              <span className="font-mono text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {exchange.exchangeId}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Original Order #{exchange.orderId} • Submitted on {new Date(exchange.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Pill & Cancel option */}
        <div className="flex items-center space-x-3">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
            exchange.status === 'Completed' || exchange.status === 'Delivered'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : isTerminated
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
          }`}>
            {exchange.status}
          </span>

          {(exchange.status === 'Request submitted' || exchange.status === 'Under review') && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/20 font-bold transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Visual 8-Step Timeline */}
      {!isTerminated && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Truck size={18} className="text-emerald-400" />
              <span>Live Exchange Progress</span>
            </h3>
            <span className="text-xs text-gray-400">
              Stage {currentStageIndex + 1} of 8
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TRACKING_STAGES.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div 
                  key={stg.id}
                  className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg' 
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-gray-500 opacity-60'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                    isCurrent 
                      ? 'bg-emerald-500 text-white animate-pulse' 
                      : isPast
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className="text-[10px] font-bold leading-tight">
                    {stg.label.replace(/^\d+\.\s*/, '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminated Alert (Cancelled or Rejected) */}
      {isTerminated && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex items-start space-x-4">
          <AlertCircle size={28} className="text-red-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">
              {exchange.status === 'Cancelled' ? 'Exchange Cancelled' : 'Exchange Request Rejected'}
            </h4>
            <p className="text-xs text-gray-300">
              {exchange.rejectionReason || 'This exchange request is no longer active.'}
            </p>
          </div>
        </div>
      )}

      {/* Grid: Garments comparison & Logistics details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Garment Comparison & Audit History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Garments Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Package size={18} className="text-emerald-400" />
              <span>Garments Involved in Exchange</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 text-xs">
              {/* Original Item */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Original Item (To Collect)</span>
                <div className="flex items-center space-x-3">
                  <img src={exchange.originalItem?.imageUrl} alt="Original" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{exchange.originalItem?.name}</p>
                    <p className="text-gray-300">Size: <strong>{exchange.originalItem?.size}</strong> • Color: {exchange.originalItem?.color}</p>
                    <p className="text-emerald-400 font-bold">${exchange.originalItem?.price}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Reason: <strong className="text-amber-400">{exchange.reason}</strong></p>
                  </div>
                </div>
              </div>

              {/* Replacement Item */}
              <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Replacement Item (To Deliver)</span>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px]">NEW</span>
                    <span className="text-base">{exchange.replacementItem?.requestedSize}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{exchange.originalItem?.name}</p>
                    <p className="text-gray-300">
                      New Size: <strong className="text-emerald-400">{exchange.replacementItem?.requestedSize}</strong>
                    </p>
                    <p className="text-gray-300">
                      New Color: <strong className="text-emerald-400">{exchange.replacementItem?.requestedColor}</strong>
                    </p>
                    <p className="text-emerald-400 font-bold">Free Replacement ($0.00)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock size={18} className="text-indigo-400" />
              <span>Exchange History & Updates</span>
            </h3>

            <div className="space-y-3.5 pl-2">
              {exchange.statusHistory?.map((hist, idx) => (
                <div key={idx} className="relative pl-6 pb-2 border-l border-white/10 last:border-l-0">
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></div>
                  <div className="flex flex-wrap items-center justify-between text-xs mb-0.5">
                    <span className="font-bold text-white">{hist.status}</span>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(hist.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{hist.comment}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Updated by {hist.updatedBy}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Pickup, Shipment & Feedback Cards */}
        <div className="space-y-6">
          
          {/* Pickup Details Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <Truck size={16} className="text-indigo-400" />
              <span>Doorstep Pickup Arrangement</span>
            </h4>
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
              <p className="text-gray-400">Courier Partner:</p>
              <p className="font-bold text-white">{exchange.pickupDetails?.courierPartner || 'Express Logistics'}</p>
              
              {exchange.pickupDetails?.pickupTrackingNumber && (
                <div>
                  <p className="text-gray-400 mt-1">Pickup Tracking ID:</p>
                  <p className="font-mono font-bold text-emerald-400">{exchange.pickupDetails.pickupTrackingNumber}</p>
                </div>
              )}

              <p className="text-gray-400 mt-1">Scheduled Date:</p>
              <p className="text-white font-semibold">{exchange.pickupDetails?.preferredDate || 'Tomorrow'}</p>
            </div>

            <div className="space-y-1 text-gray-300">
              <p className="text-gray-400">Collection Address:</p>
              <p className="font-semibold text-white">{exchange.customerDetails?.name}</p>
              <p>{exchange.pickupDetails?.address}, {exchange.pickupDetails?.city}, {exchange.pickupDetails?.pincode}</p>
              <p className="text-gray-400">Phone: {exchange.customerDetails?.phone}</p>
            </div>
          </div>

          {/* Replacement Delivery Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <Package size={16} className="text-teal-400" />
              <span>Replacement Shipment</span>
            </h4>
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
              <p className="text-gray-400">Shipping Partner:</p>
              <p className="font-bold text-white">{exchange.deliveryDetails?.replacementCourier || 'Pending Quality Check'}</p>

              {exchange.deliveryDetails?.replacementTrackingNumber && (
                <div>
                  <p className="text-gray-400 mt-1">Waybill / Tracking Number:</p>
                  <p className="font-mono font-bold text-teal-400">{exchange.deliveryDetails.replacementTrackingNumber}</p>
                </div>
              )}
            </div>

            <div className="space-y-1 text-gray-300">
              <p className="text-gray-400">Destination Address:</p>
              <p>{exchange.deliveryDetails?.address}, {exchange.deliveryDetails?.city}, {exchange.deliveryDetails?.pincode}</p>
            </div>
          </div>

          {/* Customer Satisfaction Feedback (When delivered) */}
          {(exchange.status === 'Completed' || exchange.status === 'Delivered') && (
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-3 text-xs animate-fade-in">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <Star size={16} className="text-amber-400" />
                <span>Exchange Satisfaction Feedback</span>
              </h4>

              {feedbackSubmitted ? (
                <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-500/30 text-emerald-300 space-y-1">
                  <p className="font-bold text-white">Feedback Submitted ✓</p>
                  <p>You rated this exchange {rating} out of 5 stars.</p>
                  {feedbackComment && <p className="italic">"{feedbackComment}"</p>}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-gray-300">How was your clothes exchange experience?</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          star <= rating ? 'text-amber-400' : 'text-gray-600'
                        }`}
                      >
                        <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Leave a comment (e.g. fast pickup, perfect replacement fit)..."
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-black/40 text-white"
                  />

                  <button
                    type="submit"
                    className="btn-primary w-full py-2 rounded-xl font-bold text-xs shadow-md"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ExchangeTracking;
