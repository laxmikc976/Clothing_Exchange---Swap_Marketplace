import express from 'express';
import jwt from 'jsonwebtoken';
import SwapRequest from '../models/SwapRequest.js';
import ClothingItem from '../models/ClothingItem.js';

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

// Create a swap request
router.post('/', protect, async (req, res) => {
  const { receiverId, offeredItemId, requestedItemId } = req.body;
  try {
    const swap = new SwapRequest({
      requester: req.user.id,
      receiver: receiverId,
      offeredItem: offeredItemId,
      requestedItem: requestedItemId
    });
    const createdSwap = await swap.save();
    res.status(201).json(createdSwap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's swap requests (both incoming and outgoing)
router.get('/', protect, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }]
    })
    .populate('requester', 'name')
    .populate('receiver', 'name')
    .populate('offeredItem')
    .populate('requestedItem')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update swap status (Accept/Reject)
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body; // 'accepted', 'rejected', 'completed'
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    
    // Only receiver can accept/reject
    if (swap.receiver.toString() !== req.user.id && (status === 'accepted' || status === 'rejected')) {
      return res.status(403).json({ message: 'Not authorized to update this swap' });
    }

    swap.status = status;
    await swap.save();
    
    if (status === 'accepted') {
       // Mark items as swapped or reserved
       await ClothingItem.findByIdAndUpdate(swap.offeredItem, { status: 'hidden' });
       await ClothingItem.findByIdAndUpdate(swap.requestedItem, { status: 'hidden' });
    }

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a message in negotiation chat
router.post('/:id/chat', protect, async (req, res) => {
  const { message } = req.body;
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    
    if (swap.requester.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized for this chat' });
    }

    swap.chatMessages.push({
      sender: req.user.id,
      message
    });

    await swap.save();
    res.status(201).json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
