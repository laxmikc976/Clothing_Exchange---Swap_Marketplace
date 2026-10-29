import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Upload, 
  Calendar, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  X,
  Camera,
  FileText
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// 10 Official Exchange Reasons with Examples from the Guide
const EXCHANGE_REASONS = [
  { id: 'Size too small', label: 'Size too small', example: 'The shirt is tight / restricts movement' },
  { id: 'Size too large', label: 'Size too large', example: 'The garment is loose / oversized fit' },
  { id: 'Color mismatch', label: 'Color mismatch', example: 'The color differs from the expected shade' },
  { id: 'Different from description', label: 'Different from description', example: 'The product does not match the catalog listing' },
  { id: 'Damaged product', label: 'Damaged product', example: 'The item arrived torn, ripped or damaged' },
  { id: 'Defective product', label: 'Defective product', example: 'The zipper, buttons or clasp do not work' },
  { id: 'Wrong item delivered', label: 'Wrong item delivered', example: 'A different size, color or model was received' },
  { id: 'Quality issue', label: 'Quality issue', example: 'The fabric or stitching is unsatisfactory' },
  { id: 'Style or fit issue', label: 'Style or fit issue', example: 'The cut, drape or silhouette is not suitable' },
  { id: 'Other', label: 'Other', example: 'Customer provides specific explanation below' }
];

const ExchangeRequest = () => {
  const { orderId, itemIndex } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Reason, 2: Replacement, 3: Condition/Photos, 4: Pickup, 5: Review

  // Form State
  const [selectedReason, setSelectedReason] = useState('Size too small');
  const [customerComments, setCustomerComments] = useState('');
  
  // Replacement state
  const [requestedSize, setRequestedSize] = useState('L');
  const [requestedColor, setRequestedColor] = useState('');
  const [replacementQty, setReplacementQty] = useState(1);

  // Condition state
  const [productCondition, setProductCondition] = useState('Unused with original tags');
  const [tagsIntact, setTagsIntact] = useState(true);
  const [unwashedUnworn, setUnwashedUnworn] = useState(true);
  const [photos, setPhotos] = useState([]);

  // Pickup & Customer details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [pickupPincode, setPickupPincode] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [sameDeliveryAddress, setSameDeliveryAddress] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
        
        // Populate defaults from order
        const item = res.data.items[itemIndex || 0];
        if (item) {
          setRequestedColor(item.color);
          // Default to next size
          const available = item.availableSizes || ['XS', 'S', 'M', 'L', 'XL'];
          const currentIndex = available.indexOf(item.size);
          const nextSize = currentIndex >= 0 && currentIndex < available.length - 1 
            ? available[currentIndex + 1] 
            : available[0];
          setRequestedSize(nextSize);
        }

        if (res.data.shippingAddress) {
          setCustomerName(res.data.shippingAddress.fullName || user?.name || '');
          setCustomerPhone(res.data.shippingAddress.phone || '+91 98765 43210');
          setCustomerEmail(res.data.shippingAddress.email || user?.email || '');
          setPickupAddress(res.data.shippingAddress.street || '');
          setPickupCity(res.data.shippingAddress.city || '');
          setPickupState(res.data.shippingAddress.state || '');
          setPickupPincode(res.data.shippingAddress.pincode || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, itemIndex]);

  // Handle Photo addition (simulated or real upload)
  const handleAddSamplePhoto = (url) => {
    if (photos.length < 3) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmitExchange = async () => {
    if (!order) return;
    const currentItem = order.items[itemIndex || 0];
    setSubmitting(true);

    try {
      const res = await api.post('/exchanges', {
        orderId: order.orderId,
        originalItem: {
          productId: currentItem.productId,
          name: currentItem.name,
          brand: currentItem.brand,
          imageUrl: currentItem.imageUrl,
          size: currentItem.size,
          color: currentItem.color,
          quantity: currentItem.quantity,
          price: currentItem.price
        },
        replacementItem: {
          requestedSize,
          requestedColor,
          replacementProduct: currentItem.name,
          quantity: replacementQty,
          price: currentItem.price
        },
        reason: selectedReason,
        customerComments,
        photos,
        productCondition,
        tagsIntact,
        unwashedUnworn,
        customerDetails: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail
        },
        pickupDetails: {
          address: pickupAddress,
          city: pickupCity,
          state: pickupState,
          pincode: pickupPincode,
          preferredDate
        },
        deliveryDetails: {
          address: pickupAddress,
          city: pickupCity,
          state: pickupState,
          pincode: pickupPincode
        }
      });

      alert(`Exchange request ${res.data.exchangeId} placed successfully!`);
      navigate(`/exchange-track/${res.data.exchangeId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error submitting exchange request. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Verifying order eligibility...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <button onClick={() => navigate('/orders')} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">
          Back to My Orders
        </button>
      </div>
    );
  }

  const currentItem = order.items[itemIndex || 0];
  const availableSizes = currentItem.availableSizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = currentItem.availableColors || ['Black', 'White', 'Navy Blue', 'Maroon', 'Olive'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center">
            <ArrowRightLeft className="mr-3 text-emerald-400" size={28} />
            Request Clothes Exchange
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Order #{order.orderId} • Delivered on {new Date(order.deliveryDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Item Summary Banner */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center space-x-4 bg-slate-950/60">
        <img 
          src={currentItem.imageUrl} 
          alt={currentItem.name} 
          className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-white/10 shrink-0" 
        />
        <div className="min-w-0 flex-grow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{currentItem.brand}</span>
          <h3 className="text-white font-bold text-sm truncate">{currentItem.name}</h3>
          <p className="text-xs text-gray-300 mt-0.5">
            Current: Size <strong className="text-white">{currentItem.size}</strong> • Color <strong className="text-white">{currentItem.color}</strong> • ${currentItem.price}
          </p>
        </div>
        <div className="hidden sm:block text-right shrink-0">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Free Exchange Policy Active
          </span>
        </div>
      </div>

      {/* Progress Wizard Steps */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, label: '1. Reason' },
          { num: 2, label: '2. Replacement' },
          { num: 3, label: '3. Condition' },
          { num: 4, label: '4. Pickup' },
          { num: 5, label: '5. Review' }
        ].map((s) => (
          <div 
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`p-2.5 rounded-xl border transition-all ${
              step === s.num 
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md' 
                : step > s.num
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 cursor-pointer'
                : 'bg-white/5 text-gray-400 border-white/5'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* ================= STEP 1: SELECT REASON ================= */}
      {step === 1 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white">Select Reason for Exchange</h2>
            <p className="text-xs text-gray-400 mt-1">
              Choose the reason that best describes why you need an exchange:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXCHANGE_REASONS.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    isSelected 
                      ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{r.label}</p>
                    <p className="text-xs text-gray-400">{r.example}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-gray-500'
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Customer Comments or Explanation (Optional)
            </label>
            <textarea
              rows={3}
              value={customerComments}
              onChange={(e) => setCustomerComments(e.target.value)}
              placeholder="Provide extra details (e.g. waist fits well but sleeves are 2 inches too short)..."
              className="w-full px-4 py-3 rounded-2xl text-sm border bg-black/40 text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-primary px-7 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center space-x-2"
            >
              <span>Next: Choose Replacement</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: CHOOSE REPLACEMENT ================= */}
      {step === 2 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white">Choose Replacement Size & Color</h2>
            <p className="text-xs text-gray-400 mt-1">
              Select the new variant you wish to receive in exchange for your original garment:
            </p>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              Select Requested Size
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {availableSizes.map((sz) => {
                const isCurrent = currentItem.size === sz;
                const isSelected = requestedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setRequestedSize(sz)}
                    className={`py-3 rounded-2xl font-black text-sm border transition-all flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg ring-2 ring-emerald-500/40' 
                        : isCurrent
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>{sz}</span>
                    <span className="text-[9px] font-semibold mt-0.5 opacity-80">
                      {isCurrent ? '(Current)' : 'In Stock'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              Select Requested Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableColors.map((clr) => {
                const isSelected = requestedColor === clr;
                return (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setRequestedColor(clr)}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center space-x-2 ${
                      isSelected 
                        ? 'bg-emerald-500/20 text-white border-emerald-500 ring-2 ring-emerald-500/30' 
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 bg-emerald-400"></span>
                    <span className="truncate">{clr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Difference Indicator */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">Price Adjustment Summary</p>
              <p className="text-gray-400 mt-0.5">Size/color replacement for same product: <strong className="text-emerald-400">100% Free</strong></p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-400">$0.00</span>
              <p className="text-[10px] text-gray-400">No Extra Charge</p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="btn-primary px-7 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center space-x-2"
            >
              <span>Next: Condition & Proof</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: PRODUCT CONDITION & PHOTOS ================= */}
      {step === 3 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white">Product Condition & Eligibility</h2>
            <p className="text-xs text-gray-400 mt-1">
              Verify your returned garment meets our exchange requirements:
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">Garment Condition</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'Unused with original tags', title: 'Unused with tags', desc: 'Garment is unworn, unwashed with tags intact' },
                { id: 'Damaged or defective', title: 'Damaged on delivery', desc: 'Defect arrived from manufacturing or shipping' },
                { id: 'Other condition', title: 'Other condition', desc: 'Refer to explanation in comments' }
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => setProductCondition(c.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    productCondition === c.id 
                      ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-white text-sm">{c.title}</p>
                  <p className="text-gray-400 text-[11px] mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Condition Checkbox Pledges */}
          <div className="space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/10 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tagsIntact}
                onChange={(e) => setTagsIntact(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
              />
              <span className="text-gray-200">
                All original tags, brand labels, and barcode packaging are attached and intact.
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={unwashedUnworn}
                onChange={(e) => setUnwashedUnworn(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
              />
              <span className="text-gray-200">
                Garment is unwashed, unworn, without stains, perfumes, or alterations.
              </span>
            </label>
          </div>

          {/* Photos Upload / Attachment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 flex items-center">
                <Camera size={14} className="text-emerald-400 mr-1.5" />
                Upload Photos / Evidence (Optional, max 3 photos)
              </label>
              <span className="text-[10px] text-gray-400">Recommended for defect/damage</span>
            </div>

            {/* Photo previews */}
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 group">
                  <img src={p} alt="Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 bg-red-600/80 p-1 rounded-full text-white hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {photos.length < 3 && (
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400/60 bg-white/5 flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer p-2 text-center"
                     onClick={() => handleAddSamplePhoto("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop")}
                >
                  <Upload size={18} className="mb-1 text-emerald-400" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-primary px-7 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center space-x-2"
            >
              <span>Next: Pickup Address</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: PICKUP DETAILS ================= */}
      {step === 4 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white">Customer & Pickup Details</h2>
            <p className="text-xs text-gray-400 mt-1">
              Confirm your contact info and doorstep collection address:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Registered Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Registered Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Pickup Street Address</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="House/Flat number, Building, Street"
                className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  value={pickupState}
                  onChange={(e) => setPickupState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center">
                <Calendar size={13} className="text-emerald-400 mr-1" />
                Preferred Pickup Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 rounded-xl text-sm border bg-black/40 text-white"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="btn-primary px-7 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center space-x-2"
            >
              <span>Next: Review & Submit</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: REVIEW & POLICY ================= */}
      {step === 5 && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white">Review Exchange Request</h2>
            <p className="text-xs text-gray-400 mt-1">
              Confirm your exchange details and review store policies before submitting:
            </p>
          </div>

          {/* Comparison Card */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Returning Item</span>
              <div className="flex items-center space-x-3">
                <img src={currentItem.imageUrl} alt="Returning" className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-white text-sm">{currentItem.name}</p>
                  <p className="text-gray-300">Size: {currentItem.size} • Color: {currentItem.color}</p>
                  <p className="text-gray-400 mt-0.5">Reason: <strong className="text-amber-400">{selectedReason}</strong></p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">New Replacement Item</span>
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex flex-col items-center justify-center font-bold">
                  <span className="text-[9px]">NEW</span>
                  <span className="text-base">{requestedSize}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{currentItem.name}</p>
                  <p className="text-gray-300">Requested Size: <strong className="text-emerald-400">{requestedSize}</strong></p>
                  <p className="text-gray-300">Requested Color: <strong className="text-emerald-400">{requestedColor}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Summary Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-1 text-gray-300">
            <p className="font-bold text-white flex items-center">
              <Truck size={14} className="text-indigo-400 mr-1.5" />
              Pickup & Delivery Address
            </p>
            <p className="text-gray-300">{customerName} ({customerPhone})</p>
            <p className="text-gray-400">{pickupAddress}, {pickupCity}, {pickupState} - {pickupPincode}</p>
            <p className="text-emerald-400 font-semibold pt-1">Preferred Pickup Date: {preferredDate}</p>
          </div>

          {/* Store Exchange Policy Accordion / Checklist */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2 text-xs">
            <p className="font-bold text-white flex items-center">
              <ShieldCheck size={16} className="text-emerald-400 mr-1.5" />
              Online Clothes Exchange Policy Agreement
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300 text-[11px]">
              <li><strong>Free Pickup & Replacement:</strong> Zero shipping charges applied for replacement garment.</li>
              <li><strong>Quality Check:</strong> Collected garment must be unworn with original tags attached before replacement dispatch.</li>
              <li><strong>Tracking:</strong> You can track every stage (pickup, quality check, replacement shipment) in real time.</li>
            </ul>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15 flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitExchange}
              disabled={submitting}
              className="btn-primary px-8 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{submitting ? 'Generating Request...' : 'Submit Exchange Request'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExchangeRequest;
