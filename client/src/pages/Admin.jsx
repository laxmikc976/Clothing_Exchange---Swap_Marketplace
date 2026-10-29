import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  Truck, 
  ShieldCheck, 
  Package, 
  Clock, 
  ExternalLink,
  X,
  Check,
  Send,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('exchanges'); // Default to exchanges or dashboard

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up py-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Admin Sidebar */}
        <div className="w-full md:w-64 glass-card rounded-2xl p-4 flex flex-col h-fit border border-white/10 shrink-0">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-6 px-2">
            Admin Portal
          </h2>
          
          <nav className="space-y-2">
            <SidebarBtn 
              icon={<RotateCcw size={18} className="text-emerald-400" />} 
              label="Clothes Exchanges" 
              active={activeTab === 'exchanges'} 
              onClick={() => setActiveTab('exchanges')} 
            />
            <SidebarBtn 
              icon={<TrendingUp size={18}/>} 
              label="Overview Stats" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarBtn 
              icon={<Users size={18}/>} 
              label="Manage Users" 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')} 
            />
            <SidebarBtn 
              icon={<ShoppingBag size={18}/>} 
              label="Manage Listings" 
              active={activeTab === 'listings'} 
              onClick={() => setActiveTab('listings')} 
            />
            <SidebarBtn 
              icon={<AlertTriangle size={18}/>} 
              label="Reports & Disputes" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
            />
          </nav>
        </div>

        {/* Admin Content Area */}
        <div className="flex-grow min-w-0">
          {activeTab === 'exchanges' && <ManageExchanges />}
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'listings' && <ManageListings />}
          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
};

const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 font-bold' 
        : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white font-semibold'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

// ================= CLOTHES EXCHANGES MANAGEMENT ================= //
const ManageExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Admin Action Modals State
  const [activeModal, setActiveModal] = useState(null); // 'review' | 'pickup' | 'quality' | 'shipment'
  const [selectedEx, setSelectedEx] = useState(null);

  // Form states for modals
  const [reviewDecision, setReviewDecision] = useState('Approved');
  const [reviewReason, setReviewReason] = useState('');
  const [courierPartner, setCourierPartner] = useState('Express Logistics');
  const [pickupTracking, setPickupTracking] = useState('WAY-98214');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [markPickedUp, setMarkPickedUp] = useState(false);
  const [qualityResult, setQualityResult] = useState('Passed');
  const [qualityNotes, setQualityNotes] = useState('Garment unworn with original tags attached.');
  const [shipmentCourier, setShipmentCourier] = useState('BlueDart Express');
  const [shipmentTracking, setShipmentTracking] = useState('REP-489102');
  const [shipmentStatus, setShipmentStatus] = useState('Shipped');

  const fetchExchangeData = async () => {
    try {
      const [listRes, statRes] = await Promise.all([
        api.get(`/exchanges/admin/all?status=${statusFilter}&search=${searchTerm}`),
        api.get('/exchanges/admin/analytics')
      ]);
      setExchanges(listRes.data);
      setAnalytics(statRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeData();
  }, [statusFilter, searchTerm]);

  // Execute review decision (Approve/Reject)
  const handleReviewSubmit = async () => {
    if (!selectedEx) return;
    try {
      await api.put(`/exchanges/admin/${selectedEx._id}/review`, {
        decision: reviewDecision,
        reason: reviewReason
      });
      setActiveModal(null);
      fetchExchangeData();
    } catch (e) {
      alert('Error updating review');
    }
  };

  // Schedule pickup
  const handlePickupSubmit = async () => {
    if (!selectedEx) return;
    try {
      await api.put(`/exchanges/admin/${selectedEx._id}/pickup`, {
        courierPartner,
        pickupTrackingNumber: pickupTracking,
        pickupDate,
        markPickedUp
      });
      setActiveModal(null);
      fetchExchangeData();
    } catch (e) {
      alert('Error scheduling pickup');
    }
  };

  // Quality check
  const handleQualitySubmit = async () => {
    if (!selectedEx) return;
    try {
      await api.put(`/exchanges/admin/${selectedEx._id}/quality-check`, {
        result: qualityResult,
        notes: qualityNotes
      });
      setActiveModal(null);
      fetchExchangeData();
    } catch (e) {
      alert('Error recording inspection');
    }
  };

  // Shipment dispatch
  const handleShipmentSubmit = async () => {
    if (!selectedEx) return;
    try {
      await api.put(`/exchanges/admin/${selectedEx._id}/shipment`, {
        replacementCourier: shipmentCourier,
        replacementTrackingNumber: shipmentTracking,
        shipmentStatus
      });
      setActiveModal(null);
      fetchExchangeData();
    } catch (e) {
      alert('Error updating shipment');
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center">
          <RotateCcw className="mr-2 text-emerald-400" size={26} />
          Online Clothes Exchange Operations
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Review requests, verify inventory, assign courier pickups, record quality checks, and manage replacement shipments.
        </p>
      </div>

      {/* Analytics KPI Row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">Total Requests</p>
            <p className="text-2xl font-black text-white mt-1">{analytics.total || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-400">Under Review</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{analytics.pendingReview || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-center">
            <p className="text-[10px] font-bold uppercase text-indigo-400">Pickup Pending</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{analytics.pickupScheduled || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 text-center">
            <p className="text-[10px] font-bold uppercase text-purple-400">Quality Check</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{analytics.qualityCheck || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 text-center">
            <p className="text-[10px] font-bold uppercase text-teal-400">In Transit</p>
            <p className="text-2xl font-black text-teal-400 mt-1">{analytics.inTransit || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-400">Completed</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{analytics.completed || 0}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by EX-ID, Order ID, Customer..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'Request submitted', label: 'Submitted' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Pickup scheduled', label: 'Pickup' },
            { id: 'Item picked up', label: 'Picked Up' },
            { id: 'Quality check', label: 'QC' },
            { id: 'Shipped', label: 'Shipped' },
            { id: 'Completed', label: 'Done' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exchanges Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Loading exchange requests...</div>
      ) : exchanges.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400 text-xs space-y-2 border border-white/10">
          <RotateCcw size={36} className="mx-auto text-gray-500" />
          <p className="font-bold text-white text-sm">No exchange requests found</p>
          <p>Any exchange request submitted by customers will show up here for administrative processing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges.map((ex) => (
            <div 
              key={ex._id}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              {/* Row Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-emerald-400 text-sm">{ex.exchangeId}</span>
                  <span className="text-gray-400">• Order #{ex.orderId}</span>
                  <span className="text-gray-400">• {new Date(ex.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusBadge(ex.status)}`}>
                    {ex.status}
                  </span>
                </div>
              </div>

              {/* Garment Details & Customer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Product */}
                <div className="flex items-center space-x-3">
                  <img src={ex.originalItem?.imageUrl} alt={ex.originalItem?.name} className="w-14 h-14 rounded-xl object-cover bg-slate-800" />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{ex.originalItem?.name}</p>
                    <p className="text-gray-400">Current: {ex.originalItem?.size} • {ex.originalItem?.color}</p>
                    <p className="text-emerald-400 font-bold mt-0.5">
                      New Req: {ex.replacementItem?.requestedSize} • {ex.replacementItem?.requestedColor}
                    </p>
                  </div>
                </div>

                {/* Reason & Condition */}
                <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <p className="text-gray-400">Reason: <strong className="text-amber-400">{ex.reason}</strong></p>
                  <p className="text-gray-300">Condition: <strong className="text-white">{ex.productCondition}</strong></p>
                  {ex.customerComments && (
                    <p className="text-gray-400 italic truncate">Note: "{ex.customerComments}"</p>
                  )}
                </div>

                {/* Customer & Address */}
                <div className="space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <p className="font-bold text-white">{ex.customerDetails?.name}</p>
                  <p className="text-gray-400">{ex.pickupDetails?.city}, {ex.pickupDetails?.pincode} • {ex.customerDetails?.phone}</p>
                  <p className="text-emerald-400 text-[11px]">Pickup: {ex.pickupDetails?.preferredDate || 'Tomorrow'}</p>
                </div>
              </div>

              {/* Action Buttons for Administrator */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5 text-xs">
                <Link
                  to={`/exchange-track/${ex.exchangeId}`}
                  className="text-gray-400 hover:text-white flex items-center space-x-1"
                >
                  <Eye size={13} className="text-emerald-400" />
                  <span>Customer View</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Step 1: Review Button (if submitted or under review) */}
                  {(ex.status === 'Request submitted' || ex.status === 'Under review') && (
                    <button
                      onClick={() => { setSelectedEx(ex); setActiveModal('review'); }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-xs transition-colors"
                    >
                      Review & Approve
                    </button>
                  )}

                  {/* Step 2: Pickup Scheduling (if approved or pickup scheduled) */}
                  {(ex.status === 'Approved' || ex.status === 'Pickup scheduled') && (
                    <button
                      onClick={() => { setSelectedEx(ex); setActiveModal('pickup'); }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 font-bold text-xs flex items-center space-x-1 transition-colors"
                    >
                      <Truck size={13} />
                      <span>{ex.status === 'Approved' ? 'Schedule Pickup' : 'Record Picked Up'}</span>
                    </button>
                  )}

                  {/* Step 3: Quality Check (if item picked up or QC) */}
                  {(ex.status === 'Item picked up' || ex.status === 'Quality check') && (
                    <button
                      onClick={() => { setSelectedEx(ex); setActiveModal('quality'); }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-bold text-xs flex items-center space-x-1 transition-colors"
                    >
                      <ShieldCheck size={13} />
                      <span>Perform Quality Check</span>
                    </button>
                  )}

                  {/* Step 4: Dispatch Replacement (if replacement processing or shipped) */}
                  {(ex.status === 'Replacement processing' || ex.status === 'Shipped' || ex.status === 'Out for delivery') && (
                    <button
                      onClick={() => { setSelectedEx(ex); setActiveModal('shipment'); }}
                      className="btn-primary px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-md"
                    >
                      <Package size={13} />
                      <span>Dispatch Replacement</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL 1: REVIEW & APPROVAL ================= */}
      {activeModal === 'review' && selectedEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Review Clothes Exchange Request</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="text-xs space-y-2 text-gray-300 bg-white/5 p-3 rounded-2xl">
              <p>Customer: <strong>{selectedEx.customerDetails?.name}</strong></p>
              <p>Item: <strong>{selectedEx.originalItem?.name}</strong></p>
              <p>Reason: <strong className="text-amber-400">{selectedEx.reason}</strong></p>
              <p>Requested: <strong className="text-emerald-400">{selectedEx.replacementItem?.requestedSize} / {selectedEx.replacementItem?.requestedColor}</strong></p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">Decision</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setReviewDecision('Approved')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    reviewDecision === 'Approved' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision('Rejected')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    reviewDecision === 'Rejected' ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  Reject Request
                </button>
              </div>

              {reviewDecision === 'Rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rejection Reason</label>
                  <input
                    type="text"
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="e.g. Beyond 7-day policy or item marked final sale"
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-black/40 text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white">Cancel</button>
              <button onClick={handleReviewSubmit} className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg">Save Decision</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SCHEDULE PICKUP ================= */}
      {activeModal === 'pickup' && selectedEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Assign Doorstep Pickup Partner</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Courier Partner</label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white"
                >
                  <option value="Express Logistics">Express Logistics</option>
                  <option value="BlueDart Logistics">BlueDart Logistics</option>
                  <option value="Delhivery Surface">Delhivery Surface</option>
                  <option value="FedEx Domestic">FedEx Domestic</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Pickup Waybill / Tracking ID</label>
                <input
                  type="text"
                  value={pickupTracking}
                  onChange={(e) => setPickupTracking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Scheduled Collection Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white"
                />
              </div>

              <label className="flex items-center space-x-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markPickedUp}
                  onChange={(e) => setMarkPickedUp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500"
                />
                <span className="text-emerald-400 font-bold">Mark as "Item Picked Up" (Collected by courier)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white">Cancel</button>
              <button onClick={handlePickupSubmit} className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg">Save Pickup</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: QUALITY INSPECTION ================= */}
      {activeModal === 'quality' && selectedEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Record Quality Inspection</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-gray-300">Inspection Result</label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setQualityResult('Passed')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors ${
                    qualityResult === 'Passed' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  PASSED (Unworn & Tags Intact)
                </button>
                <button
                  type="button"
                  onClick={() => setQualityResult('Failed')}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors ${
                    qualityResult === 'Failed' ? 'bg-red-500 text-white border-red-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  FAILED (Worn/Tags Missing)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Inspector Notes</label>
                <textarea
                  rows={2}
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white">Cancel</button>
              <button onClick={handleQualitySubmit} className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg">Submit QC Record</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DISPATCH REPLACEMENT ================= */}
      {activeModal === 'shipment' && selectedEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Dispatch Replacement Shipment</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Shipment Status</label>
                <select
                  value={shipmentStatus}
                  onChange={(e) => setShipmentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white font-bold"
                >
                  <option value="Shipped">Shipped / Dispatched</option>
                  <option value="Out for delivery">Out for Delivery</option>
                  <option value="Completed">Delivered & Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Replacement Courier</label>
                <input
                  type="text"
                  value={shipmentCourier}
                  onChange={(e) => setShipmentCourier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Replacement Tracking / Waybill</label>
                <input
                  type="text"
                  value={shipmentTracking}
                  onChange={(e) => setShipmentTracking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-black/40 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white">Cancel</button>
              <button onClick={handleShipmentSubmit} className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg">Update Shipment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const AdminDashboard = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Platform Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value="1,245" change="+12%" icon={<Users className="text-[var(--color-secondary)]"/>} />
      <StatCard title="Active Listings" value="3,892" change="+5%" icon={<ShoppingBag className="text-[var(--color-primary)]"/>} />
      <StatCard title="Successful Swaps" value="856" change="+24%" icon={<CheckCircle className="text-green-400"/>} />
      <StatCard title="Active Disputes" value="12" change="-2%" icon={<AlertTriangle className="text-red-400"/>} />
    </div>
    
    <div className="glass-card rounded-2xl p-6 border border-white/10 mt-6">
       <h4 className="text-lg font-bold text-white mb-4">Recent Activity</h4>
       <div className="space-y-4">
         {[1,2,3,4].map(i => (
           <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center space-x-3">
               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
               <p className="text-sm text-gray-300">User <span className="font-bold text-white">@sarah99</span> listed a new item: Vintage Levis</p>
             </div>
             <span className="text-xs text-gray-500">2 mins ago</span>
           </div>
         ))}
       </div>
    </div>
  </div>
);

const StatCard = ({ title, value, change, icon }) => (
  <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {change}
      </span>
    </div>
    <h4 className="text-2xl font-extrabold text-white">{value}</h4>
    <p className="text-sm text-[var(--color-text-muted)] font-medium mt-1">{title}</p>
  </div>
);

const ManageUsers = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-white">Manage Users</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 border-b border-white/10 text-[var(--color-text-muted)] text-sm">
          <tr>
            <th className="p-3 rounded-tl-lg">User</th>
            <th className="p-3">Email</th>
            <th className="p-3">Status</th>
            <th className="p-3 rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-300 divide-y divide-white/5">
          {[1,2,3].map(i => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="p-3 font-medium text-white">Jane Doe</td>
              <td className="p-3 text-gray-400">jane.doe@example.com</td>
              <td className="p-3"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">Active</span></td>
              <td className="p-3">
                <button className="text-red-400 hover:text-red-300 transition-colors flex items-center text-xs font-bold"><Trash2 size={14} className="mr-1"/> Suspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ManageListings = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-20 text-[var(--color-text-muted)]">
    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-xl font-bold text-white mb-2">Listing Management</h3>
    <p>View, edit, or remove community listings here.</p>
  </div>
);

const Reports = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-20 text-[var(--color-text-muted)]">
    <AlertTriangle size={48} className="mx-auto mb-4 text-red-400/50" />
    <h3 className="text-xl font-bold text-white mb-2">Dispute Resolution</h3>
    <p>Handle reported items and user conflicts.</p>
  </div>
);

export default Admin;
