import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Truck, 
  Tag, 
  RotateCcw,
  Sparkles,
  MapPin,
  Star,
  Circle,
  CheckCheck
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Visual status stages for the exchange lifecycle
const EXCHANGE_STAGES = [
  'Request submitted',
  'Under review',
  'Approved',
  'Pickup scheduled',
  'Item picked up',
  'Quality check',
  'Replacement processing',
  'Shipped',
  'Out for delivery',
  'Delivered',
  'Completed',
];

const getStageIndex = (status) => EXCHANGE_STAGES.indexOf(status);

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'exchanges'
  const [orders, setOrders] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, exchangesRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/exchanges/my-exchanges')
      ]);
      setOrders(ordersRes.data);
      setExchanges(exchangesRes.data);
    } catch (error) {
      console.error('Failed to load orders & exchanges', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Request submitted':
      case 'Under review':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Approved':
      case 'Pickup scheduled':
      case 'Item picked up':
      case 'Quality check':
      case 'Replacement processing':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Shipped':
      case 'Out for delivery':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Completed':
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  // Count pending vs completed exchanges
  const pendingCount = exchanges.filter(ex => ex.status !== 'Completed' && ex.status !== 'Cancelled' && ex.status !== 'Rejected').length;
  const completedCount = exchanges.filter(ex => ex.status === 'Completed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center">
            <Package className="mr-3 text-emerald-400" size={32} />
            My Orders &amp; Clothes Exchange Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            View delivered clothing purchases, request size or color replacements, and track exchange pickups.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Purchased Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('exchanges')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'exchanges' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <RotateCcw size={14} />
            <span>Exchange Requests ({exchanges.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading your orders &amp; exchange history...</p>
        </div>
      ) : activeTab === 'orders' ? (
        /* ================= ORDERS TAB ================= */
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-white/10">
              <Package size={48} className="mx-auto text-gray-500" />
              <h3 className="text-xl font-bold text-white">No Orders Found</h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                You haven't purchased any clothing items yet. Explore the marketplace to find sustainable garments!
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order._id} 
                className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl transition-all hover:border-white/20"
              >
                {/* Order Header */}
                <div className="bg-slate-950/70 p-4 md:px-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Order ID</p>
                      <p className="font-mono font-black text-white text-sm">{order.orderId}</p>
                    </div>
                    <div className="hidden sm:block border-l border-white/10 pl-4">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Order Date</p>
                      <p className="text-gray-200 font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="hidden md:block border-l border-white/10 pl-4">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Delivered On</p>
                      <p className="text-emerald-400 font-semibold">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="hidden md:block border-l border-white/10 pl-4">
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Items</p>
                      <p className="text-white font-bold">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 size={13} />
                      <span>{order.orderStatus}</span>
                    </span>
                    <span className="font-extrabold text-white text-sm">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 md:p-6 space-y-4">
                  {order.items.map((item, index) => {
                    // Check if an exchange already exists for this item
                    const activeExchange = exchanges.find(
                      ex => ex.orderId === order.orderId && ex.originalItem?.name === item.name
                    );

                    return (
                      <div 
                        key={index}
                        className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        {/* Item Photo & Details */}
                        <div className="flex items-center space-x-4 min-w-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-20 h-20 rounded-2xl object-cover bg-slate-800 border border-white/10 shrink-0"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop" }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{item.brand}</span>
                            <h4 className="text-white font-bold text-sm truncate max-w-md">{item.name}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-300 mt-1">
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Size: <strong>{item.size}</strong></span>
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Color: <strong>{item.color}</strong></span>
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Qty: <strong>{item.quantity}</strong></span>
                            </div>
                            <p className="text-xs font-black text-emerald-400 mt-1.5">₹{item.price}</p>
                          </div>
                        </div>

                        {/* Exchange Status & Action Button */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                          {activeExchange ? (
                            <div className="flex flex-col sm:items-end">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(activeExchange.status)}`}>
                                Exchange: {activeExchange.status}
                              </span>
                              <Link 
                                to={`/exchange-track/${activeExchange.exchangeId}`}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center mt-1.5"
                              >
                                <span>Track Replacement ({activeExchange.exchangeId})</span>
                                <ChevronRight size={14} />
                              </Link>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:items-end w-full sm:w-auto">
                              {/* 7-Day Eligibility Badge */}
                              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl mb-1.5 flex items-center">
                                <Sparkles size={12} className="mr-1 text-emerald-400" />
                                7-Day Exchange Window Active
                              </span>
                              
                              <Link
                                to={`/exchange/${order.orderId}/${index}`}
                                className="btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                              >
                                <RotateCcw size={14} />
                                <span>Request Clothes Exchange</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer Address Snippet */}
                <div className="px-6 py-3 bg-slate-950/40 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={13} className="text-emerald-400" />
                    <span>Delivered to: <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.city}, {order.shippingAddress.pincode}</span>
                  </div>
                  <div>
                    <span>Payment: <strong className="text-gray-300">{order.paymentMethod}</strong></span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      ) : (
        /* ================= EXCHANGES TAB ================= */
        <div className="space-y-6">
          {/* Summary pills */}
          {exchanges.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Clock size={13} /> {pendingCount} Pending
              </span>
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCheck size={13} /> {completedCount} Completed
              </span>
            </div>
          )}

          {exchanges.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-white/10">
              <RotateCcw size={48} className="mx-auto text-gray-500" />
              <h3 className="text-xl font-bold text-white">No Exchange Requests Yet</h3>
              <p className="text-gray-400 text-xs max-w-sm mx-auto">
                Need a different size or color for your delivered clothing? Go to the "Purchased Orders" tab and click "Request Clothes Exchange".
              </p>
              <button 
                onClick={() => setActiveTab('orders')}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
              >
                Browse Eligible Orders
              </button>
            </div>
          ) : (
            exchanges.map(ex => {
              const isCompleted = ex.status === 'Completed';
              const stageIdx = getStageIndex(ex.status);
              // Show 5 stages on the mini progress bar
              const MINI_STAGES = ['Request submitted', 'Approved', 'Item picked up', 'Shipped', 'Completed'];
              
              return (
                <div 
                  key={ex._id}
                  className={`glass-card rounded-3xl p-5 md:p-6 border transition-all space-y-4 ${
                    isCompleted 
                      ? 'border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.1)]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Completed Banner */}
                  {isCompleted && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5">
                      <CheckCheck size={18} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-400 font-black text-xs">Exchange Completed Successfully</p>
                        <p className="text-emerald-300/70 text-[10px]">Replacement delivered · Full lifecycle finished</p>
                      </div>
                      {ex.feedback?.rating && (
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                          {Array.from({ length: ex.feedback.rating }).map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <RotateCcw size={18} />
                      </div>
                      <div>
                        <p className="font-mono font-black text-white text-sm">Exchange ID: {ex.exchangeId}</p>
                        <p className="text-gray-400 text-[11px]">Linked Order: #{ex.orderId} • Submitted on {new Date(ex.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(ex.status)}`}>
                        {ex.status}
                      </span>
                    </div>
                  </div>

                  {/* Mini Progress Steps */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {MINI_STAGES.map((stage, i) => {
                      const stageActive = EXCHANGE_STAGES.indexOf(stage) <= stageIdx;
                      const isCurrent = stage === ex.status || (ex.status === 'Completed' && stage === 'Completed');
                      return (
                        <div key={stage} className="flex items-center gap-1.5 shrink-0">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              stageActive 
                                ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                : 'bg-white/5 border-white/20'
                            }`}>
                              {stageActive ? <CheckCheck size={10} className="text-white" /> : <Circle size={8} className="text-gray-500" />}
                            </div>
                            <span className={`text-[9px] font-bold text-center max-w-[52px] leading-tight ${stageActive ? 'text-emerald-400' : 'text-gray-600'}`}>
                              {stage.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                          {i < MINI_STAGES.length - 1 && (
                            <div className={`w-8 h-0.5 rounded-full mb-3 transition-all ${stageActive ? 'bg-emerald-500/60' : 'bg-white/10'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Exchanged Item Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 p-4 rounded-2xl border border-white/5 text-xs">
                    {/* Original Item */}
                    <div className="flex items-center space-x-3">
                      <img 
                        src={ex.originalItem?.imageUrl} 
                        alt={ex.originalItem?.name} 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Original Item (To Return)</span>
                        <p className="font-bold text-white text-sm truncate">{ex.originalItem?.name}</p>
                        <p className="text-gray-300">Size: <strong className="text-amber-400">{ex.originalItem?.size}</strong> • Color: {ex.originalItem?.color}</p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">₹{ex.originalItem?.price}</p>
                      </div>
                    </div>

                    {/* Requested Replacement */}
                    <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                      <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-400 shrink-0 font-bold">
                        <span className="text-[10px]">NEW</span>
                        <span className="text-sm">{ex.replacementItem?.requestedSize}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Requested Replacement</span>
                        <p className="font-bold text-white text-sm truncate">{ex.originalItem?.name}</p>
                        <p className="text-gray-300">
                          New Size: <strong className="text-emerald-400">{ex.replacementItem?.requestedSize}</strong> • Color: <strong className="text-emerald-400">{ex.replacementItem?.requestedColor}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason & Pickup Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-gray-400 font-semibold">Reason: </span>
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{ex.reason}</span>
                      {ex.customerComments && (
                        <span className="text-gray-400 italic ml-2">"{ex.customerComments}"</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Truck size={14} className="text-indigo-400" />
                      <span>Pickup Address: <strong>{ex.pickupDetails?.city}, {ex.pickupDetails?.pincode}</strong></span>
                    </div>
                  </div>

                  {/* Feedback (for completed exchanges) */}
                  {isCompleted && ex.feedback?.comment && (
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3 text-xs">
                      <p className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                        <Star size={12} fill="currentColor" /> Customer Feedback
                      </p>
                      <p className="text-gray-300 italic">"{ex.feedback.comment}"</p>
                    </div>
                  )}

                  {/* Tracking Action Button */}
                  <div className="flex justify-end pt-1">
                    <Link
                      to={`/exchange-track/${ex.exchangeId}`}
                      className="btn-primary px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md hover:scale-105 transition-all"
                    >
                      <span>{isCompleted ? 'View Full Timeline' : 'View Live Timeline & Tracking'}</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
