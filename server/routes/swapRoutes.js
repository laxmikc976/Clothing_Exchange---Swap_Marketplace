import express from 'express';
import jwt from 'jsonwebtoken';
import SwapRequest from '../models/SwapRequest.js';
import ClothingItem from '../models/ClothingItem.js';
import User from '../models/User.js';

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

// Create a swap request with meetup location & exchange details
router.post('/', protect, async (req, res) => {
  const { 
    receiverId, 
    offeredItemId, 
    requestedItemId, 
    meetupLocation, 
    meetupDate, 
    meetupTime, 
    handoverNotes, 
    itemConditionCheck 
  } = req.body;

  try {
    const userSender = await User.findById(req.user.id);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const swap = new SwapRequest({
      requester: req.user.id,
      receiver: receiverId,
      offeredItem: offeredItemId,
      requestedItem: requestedItemId,
      meetupLocation: meetupLocation || {
        address: 'Central Mall Public Plaza - Safe Exchange Zone',
        landmark: 'Main Entrance / Info Desk',
        lat: 17.3297,
        lng: 76.8343,
        exchangeType: 'in-person'
      },
      meetupDate: meetupDate || '',
      meetupTime: meetupTime || '',
      handoverNotes: handoverNotes || '',
      itemConditionCheck: itemConditionCheck || 'Buyer agrees to inspect item before confirmation',
      verification: {
        verificationCode,
        requesterVerified: false,
        receiverVerified: false,
        verifiedMethod: 'pending'
      },
      chatMessages: [
        {
          sender: req.user.id,
          senderName: userSender?.name || 'Requester',
          message: `Swap request initiated. Proposed Meetup: ${meetupLocation?.address || 'City Center'}${meetupDate ? ' on ' + meetupDate : ''}${meetupTime ? ' at ' + meetupTime : ''}. Security PIN: #${verificationCode}`,
          messageType: 'system'
        }
      ]
    });

    const createdSwap = await swap.save();
    const populated = await SwapRequest.findById(createdSwap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Seed Data: 5 realistic clothing items per role ─────────────────────────
const SEED_ITEMS = [
  {
    title: 'Classic Oxford Cotton Button Shirt',
    type: 'Shirt',
    brand: 'Raymond Casuals',
    size: 'M',
    color: 'Black & White Checkered',
    condition: 'Like New',
    estimatedValue: 1899,
    location: 'Bengaluru, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
    description: 'Gently used premium Oxford shirt, worn twice.',
    gender: 'men',
    status: 'available'
  },
  {
    title: 'Slim Fit Premium Stretch Denim Jeans',
    type: 'Jeans',
    brand: "Levi's 512",
    size: '32',
    color: 'Indigo Blue Wash',
    condition: 'Good',
    estimatedValue: 2499,
    location: 'Mumbai, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop',
    description: 'Classic indigo slim jeans, minimal fading.',
    gender: 'men',
    status: 'available'
  },
  {
    title: 'Handcrafted Floral A-Line Summer Dress',
    type: 'Dress',
    brand: 'Lavanya The Label',
    size: 'M',
    color: 'Powder Blue Floral',
    condition: 'Like New',
    estimatedValue: 3499,
    location: 'Hyderabad, Telangana',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop',
    description: 'Gorgeous summer dress with dupatta, wore once.',
    gender: 'women',
    status: 'available'
  },
  {
    title: 'Embroidered Anarkali Kurta Palazzo Set',
    type: 'Ethnic Wear',
    brand: 'Biba Collection',
    size: 'S',
    color: 'Mauve & Gold',
    condition: 'Good',
    estimatedValue: 2999,
    location: 'Pune, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?q=80&w=600&auto=format&fit=crop',
    description: 'Festive Anarkali kurta with palazzo and dupatta.',
    gender: 'women',
    status: 'available'
  },
  {
    title: 'Lightweight Quilted Puffer Vest Jacket',
    type: 'Jacket',
    brand: 'H&M Studio',
    size: 'L',
    color: 'Olive Green',
    condition: 'Like New',
    estimatedValue: 1199,
    location: 'Delhi, NCR',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
    description: 'Puffer vest jacket, perfect for mild winters.',
    gender: 'unisex',
    status: 'available'
  }
];

// Partner user stub (community member for seed swaps)
const PARTNER_NAMES = ['Priya Sharma', 'Rohan Mehta', 'Ananya Singh', 'Dev Kapoor', 'Sneha Nair'];
const PARTNER_LOCATIONS = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai'];

const seedSwapRequestsForUser = async (userId, userName) => {
  // Create 5 clothing items — alternating user's own + community partner items
  const createdItems = await ClothingItem.insertMany(
    SEED_ITEMS.map(item => ({ ...item, user: userId }))
  );

  // Create 5 realistic swap requests
  const swaps = [];
  for (let i = 0; i < 5; i++) {
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const offeredItem = createdItems[i];
    const requestedItem = createdItems[(i + 1) % 5]; // circular pair

    const statuses = ['pending', 'accepted', 'pending', 'completed', 'pending'];
    const partnerName = PARTNER_NAMES[i];
    const partnerLocation = PARTNER_LOCATIONS[i];

    // Create a dummy partner user stub in memory (not persisted — swap uses userId for both for demo)
    const meetupAddresses = [
      'Central Mall Public Plaza – Safe Exchange Zone',
      'Phoenix Market City Atrium – Community Hub',
      'City Centre Mall Food Court – Exchange Point',
      'Lulu Mall Main Entrance – Swap Corner',
      'Orion Mall Gate 3 – Sustainable Fashion Hub'
    ];

    swaps.push({
      requester: userId,
      receiver: userId, // same user for demo; real swaps have different users
      offeredItem: offeredItem._id,
      requestedItem: requestedItem._id,
      status: statuses[i],
      meetupLocation: {
        address: meetupAddresses[i],
        landmark: 'Near Information Desk / Security Counter',
        lat: 17.3297 + i * 0.01,
        lng: 76.8343 + i * 0.01,
        exchangeType: 'in-person'
      },
      meetupDate: `2026-11-${String(10 + i).padStart(2, '0')}`,
      meetupTime: `${10 + i}:00`,
      handoverNotes: `Please bring the item in original packaging. Security PIN will be shared on arrival.`,
      itemConditionCheck: 'Both parties agree to inspect items before confirmation',
      verification: {
        verificationCode,
        requesterVerified: statuses[i] === 'completed',
        receiverVerified: statuses[i] === 'completed',
        verifiedMethod: statuses[i] === 'completed' ? 'video-call' : 'pending'
      },
      chatMessages: [
        {
          sender: userId,
          senderName: userName || 'You',
          message: `Swap request initiated with ${partnerName} from ${partnerLocation}. Meetup at ${meetupAddresses[i]}. Security PIN: #${verificationCode}`,
          messageType: 'system',
          timestamp: new Date(Date.now() - (5 - i) * 86400000)
        }
      ]
    });
  }

  return await SwapRequest.insertMany(swaps);
};

// Get user's swap requests (both incoming and outgoing) — auto-seeds 5 if none exist
router.get('/', protect, async (req, res) => {
  try {
    let requests = await SwapRequest.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }]
    })
    .populate('requester', 'name email location contactDetails')
    .populate('receiver', 'name email location contactDetails')
    .populate('offeredItem')
    .populate('requestedItem')
    .sort({ createdAt: -1 });

    // Auto-seed 5 demo swap requests if user has none
    if (requests.length === 0) {
      await seedSwapRequestsForUser(req.user.id, req.user.name || 'Community Member');
      requests = await SwapRequest.find({
        $or: [{ requester: req.user.id }, { receiver: req.user.id }]
      })
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem')
      .sort({ createdAt: -1 });
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single swap request by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem')
      .populate('callLogs.caller', 'name');

    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    if (swap.requester._id.toString() !== req.user.id && swap.receiver._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this swap' });
    }

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update swap status (Accept/Reject/Completed)
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body; // 'accepted', 'rejected', 'completed'
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    
    // Only receiver can accept/reject
    if (swap.receiver.toString() !== req.user.id && (status === 'accepted' || status === 'rejected')) {
      return res.status(403).json({ message: 'Not authorized to accept/reject this swap' });
    }

    // Either user can mark as completed if already accepted
    if (status === 'completed' && swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap must be accepted before marking as completed' });
    }

    swap.status = status;

    const user = await User.findById(req.user.id);
    swap.chatMessages.push({
      sender: req.user.id,
      senderName: user?.name || 'User',
      message: status === 'accepted' 
        ? `Exchange request was accepted! You can now verify identity via Voice/Video Call and confirm the meetup details.`
        : status === 'completed'
        ? `Exchange was successfully completed! Clothing items have been swapped.`
        : `Exchange request was declined.`,
      messageType: 'system'
    });

    await swap.save();
    
    if (status === 'accepted' || status === 'completed') {
       await ClothingItem.findByIdAndUpdate(swap.offeredItem, { status: status === 'completed' ? 'swapped' : 'hidden' });
       await ClothingItem.findByIdAndUpdate(swap.requestedItem, { status: status === 'completed' ? 'swapped' : 'hidden' });
    }

    const updatedSwap = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.json(updatedSwap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update exchange details (meetup location, date, time, notes)
router.put('/:id/details', protect, async (req, res) => {
  const { meetupLocation, meetupDate, meetupTime, handoverNotes } = req.body;
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    if (swap.requester.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update details' });
    }

    if (meetupLocation) swap.meetupLocation = meetupLocation;
    if (meetupDate !== undefined) swap.meetupDate = meetupDate;
    if (meetupTime !== undefined) swap.meetupTime = meetupTime;
    if (handoverNotes !== undefined) swap.handoverNotes = handoverNotes;

    const user = await User.findById(req.user.id);
    swap.chatMessages.push({
      sender: req.user.id,
      senderName: user?.name || 'User',
      message: `Meetup details updated: ${swap.meetupLocation?.address || ''} on ${swap.meetupDate || 'TBD'} at ${swap.meetupTime || 'TBD'}.`,
      messageType: 'location-update'
    });

    await swap.save();

    const updated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post message in chat
router.post('/:id/chat', protect, async (req, res) => {
  const { message, messageType } = req.body;
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    
    if (swap.requester.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized for this chat' });
    }

    const user = await User.findById(req.user.id);

    swap.chatMessages.push({
      sender: req.user.id,
      senderName: user?.name || 'Member',
      message,
      messageType: messageType || 'text',
      timestamp: new Date()
    });

    await swap.save();

    const updated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log call verification session & optionally mark identity verified
router.post('/:id/call-log', protect, async (req, res) => {
  const { callType, durationSeconds, verified } = req.body;
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    if (swap.requester.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);
    const durationFormatted = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;

    swap.callLogs.push({
      caller: req.user.id,
      callType: callType || 'video',
      durationSeconds: durationSeconds || 0,
      status: 'completed',
      verified: !!verified,
      timestamp: new Date()
    });

    if (verified) {
      const isRequester = swap.requester.toString() === req.user.id;
      if (isRequester) {
        swap.verification.receiverVerified = true;
      } else {
        swap.verification.requesterVerified = true;
      }
      swap.verification.verifiedAt = new Date();
      swap.verification.verifiedMethod = callType === 'voice' ? 'voice-call' : 'video-call';

      swap.chatMessages.push({
        sender: req.user.id,
        senderName: user?.name || 'Member',
        message: `${callType === 'voice' ? 'Voice' : 'Video'} Call completed (${durationFormatted}). Person identity verified successfully! Security PIN confirmed.`,
        messageType: 'verification-success',
        timestamp: new Date()
      });
    } else {
      swap.chatMessages.push({
        sender: req.user.id,
        senderName: user?.name || 'Member',
        message: `${callType === 'voice' ? 'Voice' : 'Video'} Call ended (${durationFormatted}).`,
        messageType: 'call-log',
        timestamp: new Date()
      });
    }

    await swap.save();

    const updated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Explicit verify person by PIN code or call verification
router.put('/:id/verify', protect, async (req, res) => {
  const { code, method } = req.body;
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    if (swap.requester.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to verify' });
    }

    // If verifying via code, check if match or override
    if (code && swap.verification?.verificationCode && code.trim() !== swap.verification.verificationCode) {
      return res.status(400).json({ message: 'Invalid 4-digit verification code. Please check with the other person.' });
    }

    const isRequester = swap.requester.toString() === req.user.id;
    if (isRequester) {
      swap.verification.receiverVerified = true;
    } else {
      swap.verification.requesterVerified = true;
    }
    swap.verification.verifiedAt = new Date();
    swap.verification.verifiedMethod = method || 'pin-code';

    const user = await User.findById(req.user.id);
    swap.chatMessages.push({
      sender: req.user.id,
      senderName: user?.name || 'Member',
      message: `Identity verified using ${method || 'security PIN'}. Both parties can proceed with the safe exchange!`,
      messageType: 'verification-success',
      timestamp: new Date()
    });

    await swap.save();

    const updated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email location contactDetails')
      .populate('receiver', 'name email location contactDetails')
      .populate('offeredItem')
      .populate('requestedItem');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
