import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin } from 'lucide-react';

const Listings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (location) query.append('location', location);
      
      const res = await api.get(`/clothing?${query.toString()}`);
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-card p-6 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Available Swaps</h2>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-white placeholder-gray-500"
            />
          </div>
          <div className="relative flex-grow md:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            <input 
              type="text" 
              placeholder="Location..." 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-white placeholder-gray-500"
            />
          </div>
          <button type="submit" className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg">
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[var(--color-primary)]"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-muted)] glass-card rounded-3xl border border-white/5">
          <p className="text-xl">No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <Link to={`/listings/${item._id}`} key={item._id} className="group glass-card rounded-3xl overflow-hidden hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-300 border border-white/5 block">
              <div className="h-64 overflow-hidden relative bg-black/40">
                <img 
                  src={item.imageUrl || "https://via.placeholder.com/400x500?text=No+Image"} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 bg-[var(--color-primary)]/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-white shadow-lg border border-white/20">
                  Est. ${item.estimatedValue}
                </div>
              </div>
              <div className="p-6 space-y-3 relative z-10 bg-gradient-to-b from-transparent to-black/20">
                <h3 className="font-bold text-xl text-white truncate">{item.title}</h3>
                <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)]">
                  <span className="font-semibold bg-white/5 px-2 py-1 rounded-md">{item.brand}</span>
                  <span className="capitalize">{item.size} • {item.condition}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-[var(--color-text-muted)] pt-3 border-t border-white/10">
                  <MapPin size={14} className="text-[var(--color-secondary)]" />
                  <span>{item.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;
