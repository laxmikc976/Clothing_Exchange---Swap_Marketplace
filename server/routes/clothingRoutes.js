import express from 'express';
import jwt from 'jsonwebtoken';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id: ... }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Create a new clothing listing
router.post('/', protect, async (req, res) => {
  const { title, type, brand, size, condition, estimatedValue, location, imageUrl, description, gender } = req.body;
  try {
    const item = new ClothingItem({
      user: req.user.id,
      title, type, brand, size, condition, estimatedValue, location, imageUrl, description,
      gender: gender || 'unisex'
    });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available clothing listings
router.get('/', async (req, res) => {
  try {
    const { location, category, search, gender } = req.query;
    let query = { status: 'available' };
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (category) query.type = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (gender && gender !== 'all') query.gender = gender;

    const items = await ClothingItem.find(query).populate('user', 'name location');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single clothing item
router.get('/:id', async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id).populate('user', 'name location');
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's items
router.get('/user/me', protect, async (req, res) => {
  try {
    const items = await ClothingItem.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete clothing item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await ClothingItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
