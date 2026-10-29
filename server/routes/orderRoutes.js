import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import OnlineExchange from '../models/OnlineExchange.js';

const router = express.Router();

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Sample seed orders generator for instant testability — 5 items across 2 orders
const getSeedOrders = (userId, userName) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const eligibleUntil1 = new Date();
  eligibleUntil1.setDate(eligibleUntil1.getDate() + 4);

  const eligibleUntil2 = new Date();
  eligibleUntil2.setDate(eligibleUntil2.getDate() + 2);

  const address = {
    fullName: userName || 'Customer',
    phone: '+91 98765 43210',
    email: 'customer@example.com',
    street: 'Flat 402, Green Avenue, High Street',
    city: 'Gulbarga',
    state: 'Karnataka',
    pincode: '585102'
  };

  return [
    {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      user: userId,
      orderDate: sevenDaysAgo,
      deliveryDate: threeDaysAgo,
      orderStatus: 'Delivered',
      totalAmount: 5597,
      paymentMethod: 'UPI / NetBanking',
      shippingAddress: address,
      items: [
        {
          productId: 'PRD-SHIRT-01',
          name: 'Classic Checkered Oxford Cotton Button Shirt',
          brand: 'Raymond Casuals',
          imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
          size: 'M',
          color: 'Black & White Checkered',
          quantity: 1,
          price: 1899,
          availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          availableColors: ['Black & White Checkered', 'Navy Blue', 'Classic White', 'Sage Green'],
          isExchangeEligible: true,
          eligibleUntil: eligibleUntil1
        },
        {
          productId: 'PRD-JEANS-02',
          name: 'Slim Fit Premium Stretch Denim Jeans',
          brand: "Levi's 512",
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop',
          size: '32',
          color: 'Indigo Blue Wash',
          quantity: 1,
          price: 2499,
          availableSizes: ['28', '30', '32', '34', '36', '38'],
          availableColors: ['Indigo Blue Wash', 'Stone Washed Grey', 'Black Ripped', 'Dark Navy'],
          isExchangeEligible: true,
          eligibleUntil: eligibleUntil1
        },
        {
          productId: 'PRD-JACKET-03',
          name: 'Lightweight Quilted Puffer Vest Jacket',
          brand: 'H&M Studio',
          imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
          size: 'L',
          color: 'Olive Green',
          quantity: 1,
          price: 1199,
          availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
          availableColors: ['Olive Green', 'Rust Orange', 'Charcoal Black', 'Dusty Rose'],
          isExchangeEligible: true,
          eligibleUntil: eligibleUntil1
        }
      ]
    },
    {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      user: userId,
      orderDate: new Date(Date.now() - 9 * 86400000),
      deliveryDate: fiveDaysAgo,
      orderStatus: 'Delivered',
      totalAmount: 6498,
      paymentMethod: 'Credit Card',
      shippingAddress: address,
      items: [
        {
          productId: 'PRD-DRESS-04',
          name: 'Handcrafted Floral A-Line Summer Dress with Dupatta',
          brand: 'Lavanya The Label',
          imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
          size: 'M',
          color: 'Powder Blue Floral',
          quantity: 1,
          price: 3499,
          availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
          availableColors: ['Powder Blue Floral', 'Blush Pink', 'Emerald Green', 'Mustard Yellow'],
          isExchangeEligible: true,
          eligibleUntil: eligibleUntil2
        },
        {
          productId: 'PRD-KURTA-05',
          name: 'Embroidered Anarkali Kurta with Palazzo Set',
          brand: 'Biba Collection',
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?q=80&w=600&auto=format&fit=crop',
          size: 'S',
          color: 'Mauve & Gold',
          quantity: 1,
          price: 2999,
          availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          availableColors: ['Mauve & Gold', 'Teal Blue', 'Coral Red', 'Ivory White'],
          isExchangeEligible: true,
          eligibleUntil: eligibleUntil2
        }
      ]
    }
  ];
};


// Get current user's orders (auto-seeds 5 items if none or if old 2-item seed exists)
router.get('/my-orders', protect, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user.id }).sort({ orderDate: -1 });

    // Count total items across all orders
    const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);

    if (totalItems < 5) {
      // Remove old seed orders AND stale seeded exchanges, then re-seed with 5 items
      await Order.deleteMany({ user: req.user.id });
      await OnlineExchange.deleteMany({ user: req.user.id });
      const seedData = getSeedOrders(req.user.id, req.user.name || 'Valued Customer');
      orders = await Order.insertMany(seedData);
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get single order by orderId
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderId: req.params.orderId,
      user: req.user.id 
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed sample orders route
router.post('/seed', protect, async (req, res) => {
  try {
    const seedData = getSeedOrders(req.user.id, req.user.name);
    const created = await Order.insertMany(seedData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
