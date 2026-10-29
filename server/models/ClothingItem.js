import mongoose from 'mongoose';

const clothingItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  brand: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, default: '' },
  condition: { type: String, required: true },
  estimatedValue: { type: Number, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  gender: { type: String, enum: ['men', 'women', 'kids', 'unisex'], default: 'unisex' },
  status: { type: String, enum: ['available', 'swapped', 'hidden'], default: 'available' }
}, { timestamps: true });

const ClothingItem = mongoose.model('ClothingItem', clothingItemSchema);
export default ClothingItem;
