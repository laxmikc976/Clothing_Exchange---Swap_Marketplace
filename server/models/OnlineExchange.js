import mongoose from 'mongoose';

const onlineExchangeSchema = new mongoose.Schema({
  exchangeId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => 'EX-' + Math.floor(10000 + Math.random() * 90000) 
  },
  orderId: { type: String, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Original Order & Item Details
  originalItem: {
    productId: { type: String },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    imageUrl: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    deliveryDate: { type: Date },
    orderDate: { type: Date },
    paymentMethod: { type: String }
  },

  // Replacement Request Details
  replacementItem: {
    requestedSize: { type: String, required: true },
    requestedColor: { type: String, required: true },
    replacementProduct: { type: String },
    quantity: { type: Number, default: 1 },
    priceDifference: { type: Number, default: 0 }
  },

  // Reason for Exchange (Official 10 Categorized Reasons)
  reason: {
    type: String,
    enum: [
      'Size too small',
      'Size too large',
      'Color mismatch',
      'Different from description',
      'Damaged product',
      'Defective product',
      'Wrong item delivered',
      'Quality issue',
      'Style or fit issue',
      'Other'
    ],
    required: true
  },
  customerComments: { type: String, default: '' },
  photos: { type: [String], default: [] },

  // Product Condition & Eligibility
  productCondition: {
    type: String,
    enum: ['Unused with original tags', 'Damaged or defective', 'Other condition'],
    default: 'Unused with original tags'
  },
  tagsIntact: { type: Boolean, default: true },
  unwashedUnworn: { type: Boolean, default: true },

  // Customer Contact Details
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },

  // Pickup Details
  pickupDetails: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    preferredDate: { type: String },
    courierPartner: { type: String, default: 'Express Logistics' },
    pickupTrackingNumber: { type: String, default: '' },
    scheduledAt: { type: Date },
    pickedUpAt: { type: Date }
  },

  // Replacement Delivery Details
  deliveryDetails: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    replacementCourier: { type: String, default: '' },
    replacementTrackingNumber: { type: String, default: '' },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date }
  },

  // Complete 13-stage Status Lifecycle
  status: {
    type: String,
    enum: [
      'Request submitted',
      'Under review',
      'Approved',
      'Rejected',
      'Pickup scheduled',
      'Item picked up',
      'Quality check',
      'Replacement processing',
      'Shipped',
      'Out for delivery',
      'Delivered',
      'Completed',
      'Cancelled'
    ],
    default: 'Request submitted'
  },

  // Audit History with Timestamps
  statusHistory: [{
    status: { type: String, required: true },
    comment: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' }
  }],

  // Quality Inspection Record
  qualityInspection: {
    inspected: { type: Boolean, default: false },
    result: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' },
    inspectorNotes: { type: String, default: '' },
    inspectedAt: { type: Date }
  },

  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },

  // Feedback upon delivery
  feedback: {
    rating: { type: Number },
    comment: { type: String }
  }
}, { timestamps: true });

const OnlineExchange = mongoose.model('OnlineExchange', onlineExchangeSchema);
export default OnlineExchange;
