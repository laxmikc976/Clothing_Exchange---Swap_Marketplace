import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  
  // Meetup & Exchange Details
  meetupLocation: {
    address: { type: String, default: 'Central Mall Public Plaza - Safe Exchange Zone' },
    landmark: { type: String, default: 'Near Main Entrance / Information Desk' },
    lat: { type: Number, default: 17.3297 },
    lng: { type: Number, default: 76.8343 },
    exchangeType: { type: String, enum: ['in-person', 'safe-spot', 'doorstep'], default: 'in-person' }
  },
  meetupDate: { type: String, default: '' },
  meetupTime: { type: String, default: '' },
  handoverNotes: { type: String, default: '' },
  itemConditionCheck: { type: String, default: 'Buyer agrees to inspect item before confirmation' },

  // Person Verification System
  verification: {
    verificationCode: { 
      type: String, 
      default: () => Math.floor(1000 + Math.random() * 9000).toString() 
    },
    requesterVerified: { type: Boolean, default: false },
    receiverVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedMethod: { type: String, enum: ['video-call', 'voice-call', 'pin-code', 'pending'], default: 'pending' }
  },

  // Audio/Video Call Verification Logs
  callLogs: [{
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    callType: { type: String, enum: ['voice', 'video'], default: 'video' },
    durationSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['completed', 'missed', 'declined'], default: 'completed' },
    verified: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],

  // Real-time Negotiation & Safety Chat Messages
  chatMessages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String, default: '' },
    message: { type: String, required: true },
    messageType: { 
      type: String, 
      enum: ['text', 'call-log', 'verification-success', 'location-update', 'system'], 
      default: 'text' 
    },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;
