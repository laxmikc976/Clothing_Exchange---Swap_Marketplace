import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import AddListing from './pages/AddListing';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import SwapRequests from './pages/SwapRequests';
import Orders from './pages/Orders';
import ExchangeRequest from './pages/ExchangeRequest';
import ExchangeTracking from './pages/ExchangeTracking';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/new" element={<AddListing />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/requests" element={<SwapRequests />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/exchange/:orderId/:itemIndex" element={<ExchangeRequest />} />
          <Route path="/exchange-track/:exchangeId" element={<ExchangeTracking />} />
        </Routes>
      </main>
      <footer className="glass border-t border-white/10 mt-auto relative z-10">
        <div className="container mx-auto px-4 py-6 text-center text-[var(--color-text-muted)] text-sm">
          &copy; {new Date().getFullYear()} Clothing Exchange Marketplace. All rights reserved. <br />
          <span className="text-xs opacity-75">Online Clothes Exchange, Replacement Tracking & Sustainable Fashion.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
