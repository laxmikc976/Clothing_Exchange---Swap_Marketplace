import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  imageUrl: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  availableSizes: { type: [String], default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  availableColors: { type: [String], default: ['Black', 'White', 'Navy Blue', 'Olive Green', 'Maroon'] },
  isExchangeEligible: { type: Boolean, default: true },
  eligibleUntil: { type: Date }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Credit Card / Online Banking' },
  orderStatus: { type: String, enum: ['Delivered', 'Shipped', 'Processing'], default: 'Delivered' },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date, default: Date.now },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
