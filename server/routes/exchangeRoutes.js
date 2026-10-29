import express from 'express';
import jwt from 'jsonwebtoken';
import OnlineExchange from '../models/OnlineExchange.js';
import Order from '../models/Order.js';

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

// ================= CUSTOMER ENDPOINTS ================= //

// Submit a new clothes exchange request
router.post('/', protect, async (req, res) => {
  const {
    orderId,
    originalItem,
    replacementItem,
    reason,
    customerComments,
    photos,
    productCondition,
    tagsIntact,
    unwashedUnworn,
    customerDetails,
    pickupDetails,
    deliveryDetails
  } = req.body;

  try {
    // 1. Verify that order exists and belongs to logged-in user
    const order = await Order.findOne({ orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Matching order not found or does not belong to your account' });
    }

    // 2. Prevent duplicate active exchange requests for the same product
    const existingActive = await OnlineExchange.findOne({
      orderId,
      'originalItem.name': originalItem.name,
      status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
    });

    if (existingActive) {
      return res.status(400).json({ 
        message: `An active exchange request (${existingActive.exchangeId}) is already in progress for this item.` 
      });
    }

    // 3. Server-side deadline validation (7 days policy)
    if (order.deliveryDate) {
      const daysSinceDelivery = Math.floor((new Date() - new Date(order.deliveryDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceDelivery > 7) {
        return res.status(400).json({ message: 'Exchange deadline exceeded. Requests must be placed within 7 days of delivery.' });
      }
    }

    // 4. Calculate price difference
    const priceDiff = (replacementItem.price || originalItem.price) - originalItem.price;

    const exchange = new OnlineExchange({
      orderId,
      order: order._id,
      user: req.user.id,
      originalItem: {
        ...originalItem,
        deliveryDate: order.deliveryDate,
        orderDate: order.orderDate,
        paymentMethod: order.paymentMethod
      },
      replacementItem: {
        ...replacementItem,
        priceDifference: priceDiff
      },
      reason,
      customerComments: customerComments || '',
      photos: photos || [],
      productCondition: productCondition || 'Unused with original tags',
      tagsIntact: tagsIntact !== false,
      unwashedUnworn: unwashedUnworn !== false,
      customerDetails: customerDetails || {
        name: req.user.name || order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        email: order.shippingAddress.email
      },
      pickupDetails: {
        ...pickupDetails,
        address: pickupDetails?.address || order.shippingAddress.street,
        city: pickupDetails?.city || order.shippingAddress.city,
        state: pickupDetails?.state || order.shippingAddress.state,
        pincode: pickupDetails?.pincode || order.shippingAddress.pincode,
        courierPartner: 'Express Delivery Partner'
      },
      deliveryDetails: {
        ...deliveryDetails,
        address: deliveryDetails?.address || order.shippingAddress.street,
        city: deliveryDetails?.city || order.shippingAddress.city,
        state: deliveryDetails?.state || order.shippingAddress.state,
        pincode: deliveryDetails?.pincode || order.shippingAddress.pincode
      },
      status: 'Request submitted',
      statusHistory: [
        {
          status: 'Request submitted',
          comment: 'Exchange request submitted by customer with reason: ' + reason,
          timestamp: new Date(),
          updatedBy: 'Customer'
        }
      ]
    });

    const created = await exchange.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed exchanges: 2 pending (different stages) + 1 completed
const getSeedExchanges = (userId, orders) => {
  if (!orders || orders.length < 2) return [];

  const order1 = orders[0];
  const order2 = orders[1];

  const twoDaysAgo  = new Date(Date.now() - 2 * 86400000);
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
  const sixDaysAgo  = new Date(Date.now() - 6 * 86400000);

  const basePickup = {
    address: 'Flat 402, Green Avenue, High Street',
    city: 'Gulbarga',
    state: 'Karnataka',
    pincode: '585102',
    courierPartner: 'Express Logistics',
    pickupTrackingNumber: 'TRK' + Math.floor(100000 + Math.random() * 900000)
  };

  const baseDelivery = {
    address: 'Flat 402, Green Avenue, High Street',
    city: 'Gulbarga',
    state: 'Karnataka',
    pincode: '585102',
    replacementCourier: 'Blue Dart',
    replacementTrackingNumber: ''
  };

  const baseCustomer = {
    name: order1.shippingAddress.fullName,
    phone: order1.shippingAddress.phone,
    email: order1.shippingAddress.email
  };

  return [
    // Exchange 1 — Pending: "Under review" for the Oxford Shirt
    {
      exchangeId: 'EX-' + Math.floor(10000 + Math.random() * 90000),
      orderId: order1.orderId,
      order: order1._id,
      user: userId,
      originalItem: {
        productId: 'PRD-SHIRT-01',
        name: 'Classic Checkered Oxford Cotton Button Shirt',
        brand: 'Raymond Casuals',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
        size: 'M',
        color: 'Black & White Checkered',
        quantity: 1,
        price: 1899,
        deliveryDate: order1.deliveryDate,
        orderDate: order1.orderDate,
        paymentMethod: order1.paymentMethod
      },
      replacementItem: {
        requestedSize: 'L',
        requestedColor: 'Navy Blue',
        quantity: 1,
        priceDifference: 0
      },
      reason: 'Size too small',
      customerComments: 'Fits a bit tight on the shoulders, need a size up.',
      productCondition: 'Unused with original tags',
      tagsIntact: true,
      unwashedUnworn: true,
      customerDetails: baseCustomer,
      pickupDetails: { ...basePickup, preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
      deliveryDetails: { ...baseDelivery },
      status: 'Under review',
      statusHistory: [
        { status: 'Request submitted', comment: 'Exchange request submitted by customer.', timestamp: twoDaysAgo, updatedBy: 'Customer' },
        { status: 'Under review', comment: 'Request received and is being reviewed by our exchange team.', timestamp: new Date(twoDaysAgo.getTime() + 3 * 3600000), updatedBy: 'Exchange Team' }
      ]
    },

    // Exchange 2 — Pending: "Pickup scheduled" for the Denim Jeans
    {
      exchangeId: 'EX-' + Math.floor(10000 + Math.random() * 90000),
      orderId: order1.orderId,
      order: order1._id,
      user: userId,
      originalItem: {
        productId: 'PRD-JEANS-02',
        name: 'Slim Fit Premium Stretch Denim Jeans',
        brand: "Levi's 512",
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop',
        size: '32',
        color: 'Indigo Blue Wash',
        quantity: 1,
        price: 2499,
        deliveryDate: order1.deliveryDate,
        orderDate: order1.orderDate,
        paymentMethod: order1.paymentMethod
      },
      replacementItem: {
        requestedSize: '34',
        requestedColor: 'Stone Washed Grey',
        quantity: 1,
        priceDifference: 0
      },
      reason: 'Size too small',
      customerComments: 'Waist size is slightly off. Prefer 34 in a different wash.',
      productCondition: 'Unused with original tags',
      tagsIntact: true,
      unwashedUnworn: true,
      customerDetails: baseCustomer,
      pickupDetails: {
        ...basePickup,
        scheduledAt: new Date(Date.now() + 86400000),
        preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
      },
      deliveryDetails: { ...baseDelivery },
      status: 'Pickup scheduled',
      statusHistory: [
        { status: 'Request submitted', comment: 'Exchange request submitted by customer.', timestamp: fourDaysAgo, updatedBy: 'Customer' },
        { status: 'Under review', comment: 'Request received and is being reviewed by our exchange team.', timestamp: new Date(fourDaysAgo.getTime() + 2 * 3600000), updatedBy: 'Exchange Team' },
        { status: 'Approved', comment: 'Exchange request approved. Pickup agent will collect the item.', timestamp: new Date(fourDaysAgo.getTime() + 6 * 3600000), updatedBy: 'Exchange Manager' },
        { status: 'Pickup scheduled', comment: 'Courier pickup scheduled for tomorrow between 10AM–1PM.', timestamp: twoDaysAgo, updatedBy: 'Logistics Team' }
      ]
    },

    // Exchange 3 — Completed for the Floral Summer Dress
    {
      exchangeId: 'EX-' + Math.floor(10000 + Math.random() * 90000),
      orderId: order2.orderId,
      order: order2._id,
      user: userId,
      originalItem: {
        productId: 'PRD-DRESS-04',
        name: 'Handcrafted Floral A-Line Summer Dress with Dupatta',
        brand: 'Lavanya The Label',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
        size: 'M',
        color: 'Powder Blue Floral',
        quantity: 1,
        price: 3499,
        deliveryDate: order2.deliveryDate,
        orderDate: order2.orderDate,
        paymentMethod: order2.paymentMethod
      },
      replacementItem: {
        requestedSize: 'S',
        requestedColor: 'Blush Pink',
        quantity: 1,
        priceDifference: 0,
        replacementProduct: 'Handcrafted Floral A-Line Summer Dress — Blush Pink, S'
      },
      reason: 'Color mismatch',
      customerComments: 'The color appeared very different from the product photo. Requesting Blush Pink instead.',
      productCondition: 'Unused with original tags',
      tagsIntact: true,
      unwashedUnworn: true,
      customerDetails: baseCustomer,
      pickupDetails: {
        ...basePickup,
        scheduledAt: sixDaysAgo,
        pickedUpAt: new Date(sixDaysAgo.getTime() + 5 * 3600000)
      },
      deliveryDetails: {
        ...baseDelivery,
        replacementTrackingNumber: 'BDA' + Math.floor(100000 + Math.random() * 900000),
        dispatchedAt: fourDaysAgo,
        deliveredAt: twoDaysAgo
      },
      status: 'Completed',
      qualityInspection: {
        inspected: true,
        result: 'Passed',
        inspectorNotes: 'Item returned in perfect condition with original tags.',
        inspectedAt: new Date(sixDaysAgo.getTime() + 10 * 3600000)
      },
      statusHistory: [
        { status: 'Request submitted', comment: 'Exchange request submitted by customer.', timestamp: sixDaysAgo, updatedBy: 'Customer' },
        { status: 'Under review', comment: 'Request received and is being reviewed by our exchange team.', timestamp: new Date(sixDaysAgo.getTime() + 1 * 3600000), updatedBy: 'Exchange Team' },
        { status: 'Approved', comment: 'Color mismatch confirmed. Exchange approved.', timestamp: new Date(sixDaysAgo.getTime() + 4 * 3600000), updatedBy: 'Exchange Manager' },
        { status: 'Pickup scheduled', comment: 'Courier pickup scheduled.', timestamp: new Date(sixDaysAgo.getTime() + 5 * 3600000), updatedBy: 'Logistics Team' },
        { status: 'Item picked up', comment: 'Item collected from customer location.', timestamp: new Date(sixDaysAgo.getTime() + 10 * 3600000), updatedBy: 'Courier Agent' },
        { status: 'Quality check', comment: 'Item is undergoing quality inspection.', timestamp: new Date(fourDaysAgo.getTime() + 2 * 3600000), updatedBy: 'QC Team' },
        { status: 'Replacement processing', comment: 'Replacement item has been identified and is being packed.', timestamp: fourDaysAgo, updatedBy: 'Warehouse' },
        { status: 'Shipped', comment: 'Replacement dispatched via Blue Dart.', timestamp: fourDaysAgo, updatedBy: 'Logistics Team' },
        { status: 'Out for delivery', comment: 'Package is out for delivery with courier agent.', timestamp: twoDaysAgo, updatedBy: 'Courier Driver' },
        { status: 'Delivered', comment: 'Replacement item delivered to customer.', timestamp: twoDaysAgo, updatedBy: 'Courier Partner' },
        { status: 'Completed', comment: 'Exchange lifecycle completed successfully.', timestamp: twoDaysAgo, updatedBy: 'System' }
      ],
      feedback: {
        rating: 5,
        comment: 'Super smooth exchange process! Got my replacement within 4 days. Highly recommend this service.'
      }
    }
  ];
};

// Get customer's exchange requests (auto-seeds 3 exchanges if none exist)
router.get('/my-exchanges', protect, async (req, res) => {
  try {
    let exchanges = await OnlineExchange.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (exchanges.length === 0) {
      // Fetch the user's existing orders to link the seeded exchanges
      const orders = await Order.find({ user: req.user.id }).sort({ orderDate: -1 });
      if (orders.length >= 2) {
        const seedData = getSeedExchanges(req.user.id, orders);
        if (seedData.length > 0) {
          exchanges = await OnlineExchange.insertMany(seedData);
        }
      }
    }

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get single exchange request tracking by ID or exchangeId string
router.get('/:exchangeId', protect, async (req, res) => {
  try {
    const { exchangeId } = req.params;
    let exchange = null;

    if (exchangeId.startsWith('EX-')) {
      exchange = await OnlineExchange.findOne({ exchangeId });
    } else {
      exchange = await OnlineExchange.findById(exchangeId);
    }

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange request not found' });
    }

    // Verify ownership if not admin
    if (exchange.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this exchange' });
    }

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel exchange request
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    if (exchange.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (exchange.status !== 'Request submitted' && exchange.status !== 'Under review') {
      return res.status(400).json({ message: 'Cannot cancel request once approved or pickup has commenced' });
    }

    exchange.status = 'Cancelled';
    exchange.statusHistory.push({
      status: 'Cancelled',
      comment: 'Cancelled by customer',
      timestamp: new Date(),
      updatedBy: 'Customer'
    });

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer rating & feedback
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    exchange.feedback = { rating, comment };
    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ADMIN MANAGEMENT ENDPOINTS ================= //

// Get all exchanges (Admin) with search & status filters
router.get('/admin/all', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { exchangeId: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'originalItem.name': { $regex: search, $options: 'i' } }
      ];
    }

    const exchanges = await OnlineExchange.find(query)
      .populate('user', 'name email location')
      .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exchange analytics (Admin)
router.get('/admin/analytics', protect, async (req, res) => {
  try {
    const total = await OnlineExchange.countDocuments();
    const pendingReview = await OnlineExchange.countDocuments({ 
      status: { $in: ['Request submitted', 'Under review'] } 
    });
    const approved = await OnlineExchange.countDocuments({ status: 'Approved' });
    const pickupScheduled = await OnlineExchange.countDocuments({ 
      status: { $in: ['Pickup scheduled', 'Item picked up'] } 
    });
    const qualityCheck = await OnlineExchange.countDocuments({ status: 'Quality check' });
    const inTransit = await OnlineExchange.countDocuments({ 
      status: { $in: ['Replacement processing', 'Shipped', 'Out for delivery'] } 
    });
    const completed = await OnlineExchange.countDocuments({ status: 'Completed' });
    const rejected = await OnlineExchange.countDocuments({ status: 'Rejected' });

    // Common reasons distribution
    const reasonsAggregation = await OnlineExchange.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total,
      pendingReview,
      approved,
      pickupScheduled,
      qualityCheck,
      inTransit,
      completed,
      rejected,
      reasonsAggregation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review & Approve/Reject exchange request (Admin)
router.put('/admin/:id/review', protect, async (req, res) => {
  const { decision, reason, adminNotes } = req.body; // decision: 'Approved' | 'Rejected'
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    exchange.status = decision;
    if (adminNotes) exchange.adminNotes = adminNotes;
    if (decision === 'Rejected') exchange.rejectionReason = reason || 'Does not comply with exchange policy.';

    exchange.statusHistory.push({
      status: decision,
      comment: decision === 'Approved' 
        ? 'Exchange request approved by store administrator. Replacement reserved in inventory.' 
        : `Request rejected: ${reason || 'Policy criteria not met.'}`,
      timestamp: new Date(),
      updatedBy: 'Store Admin'
    });

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Schedule Pickup (Admin)
router.put('/admin/:id/pickup', protect, async (req, res) => {
  const { courierPartner, pickupTrackingNumber, pickupDate, markPickedUp } = req.body;
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    if (courierPartner) exchange.pickupDetails.courierPartner = courierPartner;
    if (pickupTrackingNumber) exchange.pickupDetails.pickupTrackingNumber = pickupTrackingNumber;
    if (pickupDate) exchange.pickupDetails.preferredDate = pickupDate;

    if (markPickedUp) {
      exchange.status = 'Item picked up';
      exchange.pickupDetails.pickedUpAt = new Date();
      exchange.statusHistory.push({
        status: 'Item picked up',
        comment: `Garment collected by ${exchange.pickupDetails.courierPartner} (Waybill: ${exchange.pickupDetails.pickupTrackingNumber || 'N/A'}). In transit to Quality Center.`,
        timestamp: new Date(),
        updatedBy: 'Logistics Partner'
      });
    } else {
      exchange.status = 'Pickup scheduled';
      exchange.pickupDetails.scheduledAt = new Date();
      exchange.statusHistory.push({
        status: 'Pickup scheduled',
        comment: `Pickup arranged with ${courierPartner || 'Logistics Partner'}. Scheduled Date: ${pickupDate || 'Tomorrow'}. Tracking ID: ${pickupTrackingNumber || 'Pending'}`,
        timestamp: new Date(),
        updatedBy: 'Store Admin'
      });
    }

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quality Inspection (Admin)
router.put('/admin/:id/quality-check', protect, async (req, res) => {
  const { result, notes } = req.body; // result: 'Passed' | 'Failed'
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    exchange.qualityInspection = {
      inspected: true,
      result,
      inspectorNotes: notes || '',
      inspectedAt: new Date()
    };

    if (result === 'Passed') {
      exchange.status = 'Replacement processing';
      exchange.statusHistory.push({
        status: 'Quality check',
        comment: `Quality inspection PASSED: Item verified unworn with tags intact. Note: ${notes || 'Clean condition'}.`,
        timestamp: new Date(),
        updatedBy: 'Quality Inspector'
      });
      exchange.statusHistory.push({
        status: 'Replacement processing',
        comment: `Replacement packaging initiated for ${exchange.replacementItem.requestedSize} / ${exchange.replacementItem.requestedColor}.`,
        timestamp: new Date(),
        updatedBy: 'Fulfillment Center'
      });
    } else {
      exchange.status = 'Rejected';
      exchange.rejectionReason = `Quality inspection failed: ${notes || 'Tags missing or fabric washed/damaged.'}`;
      exchange.statusHistory.push({
        status: 'Quality check',
        comment: `Quality inspection FAILED. Returned item rejected: ${notes || 'Condition does not meet policy.'}`,
        timestamp: new Date(),
        updatedBy: 'Quality Inspector'
      });
    }

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dispatch & Update Replacement Shipment (Admin)
router.put('/admin/:id/shipment', protect, async (req, res) => {
  const { replacementCourier, replacementTrackingNumber, shipmentStatus } = req.body; 
  // shipmentStatus: 'Shipped' | 'Out for delivery' | 'Delivered' | 'Completed'
  try {
    const exchange = await OnlineExchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    if (replacementCourier) exchange.deliveryDetails.replacementCourier = replacementCourier;
    if (replacementTrackingNumber) exchange.deliveryDetails.replacementTrackingNumber = replacementTrackingNumber;

    exchange.status = shipmentStatus;

    if (shipmentStatus === 'Shipped') {
      exchange.deliveryDetails.dispatchedAt = new Date();
      exchange.statusHistory.push({
        status: 'Shipped',
        comment: `Replacement package dispatched via ${exchange.deliveryDetails.replacementCourier}. Tracking Number: ${exchange.deliveryDetails.replacementTrackingNumber}`,
        timestamp: new Date(),
        updatedBy: 'Dispatch Team'
      });
    } else if (shipmentStatus === 'Out for delivery') {
      exchange.statusHistory.push({
        status: 'Out for delivery',
        comment: `Replacement package is out for delivery with local courier agent. Expect delivery today.`,
        timestamp: new Date(),
        updatedBy: 'Courier Driver'
      });
    } else if (shipmentStatus === 'Delivered' || shipmentStatus === 'Completed') {
      exchange.deliveryDetails.deliveredAt = new Date();
      exchange.status = 'Completed';
      exchange.statusHistory.push({
        status: 'Delivered',
        comment: `Replacement item safely delivered to customer. Exchange lifecycle completed.`,
        timestamp: new Date(),
        updatedBy: 'Courier Partner'
      });
      exchange.statusHistory.push({
        status: 'Completed',
        comment: `Exchange closed successfully.`,
        timestamp: new Date(),
        updatedBy: 'System'
      });
    }

    await exchange.save();
    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
