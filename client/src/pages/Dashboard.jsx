import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { MessageCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reqRes, itemsRes] = await Promise.all([
        api.get('/swaps'),
        api.get('/clothing/user/me')
      ]);
      setRequests(reqRes.data);
      setMyItems(itemsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/swaps/${id}/status`, { status });
      fetchData(); // refresh data
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/clothing/${id}`);
        fetchData(); // refresh data
      } catch (error) {
        console.error(error);
        alert('Failed to delete item');
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-10 rounded-3xl text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 relative z-10">Welcome, {user?.name}!</h1>
        <p className="text-white/80 font-medium relative z-10 text-lg">Manage your wardrobe and swap requests here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Swap Requests */}
        <div className="glass-card p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Swap Requests</h2>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No active swap requests.</p>
            ) : (
              requests.map(req => {
                const isReceiver = req.receiver._id === user._id;
                const statusColor = req.status === 'pending' ? 'text-yellow-400 bg-yellow-400/20 border border-yellow-400/30' : 
                                    req.status === 'accepted' ? 'text-green-400 bg-green-400/20 border border-green-400/30' : 
                                    'text-red-400 bg-red-400/20 border border-red-400/30';

                return (
                  <div key={req._id} className="border border-white/10 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                          {isReceiver ? 'Incoming Request' : 'Outgoing Request'}
                        </span>
                        <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full inline-block ${statusColor}`}>
                          {req.status}
                        </div>
                      </div>
                      <Link to="/chat" className="text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] p-2.5 rounded-xl transition-colors shadow-sm" title="Chat">
                        <MessageCircle size={20} />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between bg-black/30 p-4 rounded-2xl mb-4 border border-white/5">
                      <div className="w-5/12 text-center">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1 font-medium">They offered</p>
                        <p className="font-bold text-sm text-white truncate">{req.offeredItem?.title}</p>
                        <p className="text-[var(--color-primary)] text-xs font-black mt-1">${req.offeredItem?.estimatedValue}</p>
                      </div>
                      <div className="text-[var(--color-text-muted)]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      </div>
                      <div className="w-5/12 text-center">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1 font-medium">They want</p>
                        <p className="font-bold text-sm text-white truncate">{req.requestedItem?.title}</p>
                        <p className="text-[var(--color-primary)] text-xs font-black mt-1">${req.requestedItem?.estimatedValue}</p>
                      </div>
                    </div>

                    {isReceiver && req.status === 'pending' && (
                      <div className="flex space-x-3 mt-4 pt-4 border-t border-white/10">
                        <button onClick={() => handleStatusUpdate(req._id, 'accepted')} className="flex-1 flex items-center justify-center space-x-2 bg-green-500/20 text-green-400 border border-green-500/30 py-2.5 rounded-xl text-sm font-bold hover:bg-green-500/30 transition-colors">
                          <CheckCircle size={18} /> <span>Accept</span>
                        </button>
                        <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="flex-1 flex items-center justify-center space-x-2 bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors">
                          <XCircle size={18} /> <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Wardrobe */}
        <div className="glass-card p-8 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">My Wardrobe</h2>
            <Link to="/listings/new" className="text-sm font-bold text-[var(--color-primary)] hover:text-white transition-colors bg-[var(--color-primary)]/20 px-3 py-1 rounded-lg">Add New</Link>
          </div>
          <div className="space-y-4">
            {myItems.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">Your wardrobe is empty.</p>
            ) : (
              myItems.map(item => (
                <div key={item._id} className="flex items-center space-x-4 border border-white/10 p-4 rounded-2xl bg-white/5 relative group hover:bg-white/10 transition-colors">
                  <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-xl bg-black/40 border border-white/10" onError={(e) => { e.target.src = "https://via.placeholder.com/150" }} />
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{item.brand} • Size {item.size}</p>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${item.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {item.status}
                    </span>
                    <button onClick={() => handleDeleteItem(item._id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2.5 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100" title="Delete Item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
