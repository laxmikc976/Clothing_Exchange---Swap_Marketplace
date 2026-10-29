import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import exchangeRoutes from './routes/exchangeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/exchanges', exchangeRoutes);

app.get('/', (req, res) => {
  res.send('Clothing Exchange & Swap Marketplace API is running...');
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error('MongoDB connection error:', error));
