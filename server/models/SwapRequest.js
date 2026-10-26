import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingItem', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  chatMessages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
export default SwapRequest;
