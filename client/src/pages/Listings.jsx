import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, Users, Baby, User, LayoutGrid } from 'lucide-react';

const GENDER_TABS = [
  { key: 'all',    label: 'All',    icon: LayoutGrid, color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'men',    label: 'Men',    icon: User,        color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  { key: 'women',  label: 'Women',  icon: Users,       color: '#f43f5e', gradient: 'from-rose-500 to-pink-500' },
  { key: 'kids',   label: 'Kids',   icon: Baby,        color: '#f59e0b', gradient: 'from-amber-400 to-orange-500' },
];

const GENDER_BADGE = {
  men:    { label: 'Men',    bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/30' },
  women:  { label: 'Women',  bg: 'bg-rose-500/20',   text: 'text-rose-300',   border: 'border-rose-500/30' },
  kids:   { label: 'Kids',   bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/30' },
  unisex: { label: 'Unisex', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
};

const Listings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [activeGender, setActiveGender] = useState('all');

  const fetchItems = useCallback(async (gender, s, loc) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (s) query.append('search', s);
      if (loc) query.append('location', loc);
      if (gender && gender !== 'all') query.append('gender', gender);

      const res = await api.get(`/clothing?${query.toString()}`);
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(activeGender, search, location);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGender]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(activeGender, search, location);
  };

  const activeTab = GENDER_TABS.find(t => t.key === activeGender);

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Header + Search */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Available Swaps</h2>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Browse and swap clothes across every section</p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>
            <div className="relative flex-grow md:w-40">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl font-bold shadow-lg text-sm whitespace-nowrap">
              Filter
            </button>
          </form>
        </div>

        {/* Gender Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {GENDER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeGender === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveGender(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 border ${
                  isActive
                    ? `bg-gradient-to-r ${tab.gradient} text-white border-transparent shadow-lg scale-[1.03]`
                    : 'bg-white/5 text-[var(--color-text-muted)] border-white/10 hover:bg-white/10 hover:text-white'
                }`}
                style={isActive ? { boxShadow: `0 4px 20px ${tab.color}55` } : {}}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      {activeTab && (
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${activeTab.gradient} shadow-lg`}
            style={{ boxShadow: `0 4px 16px ${activeTab.color}55` }}
          >
            <activeTab.icon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {activeTab.key === 'all' ? 'All Listings' : `${activeTab.label}'s Collection`}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(to right, ${activeTab.color}40, transparent)` }} />
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2"
            style={{ borderColor: activeTab?.color || 'var(--color-primary)' }}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/5 space-y-3">
          <div className="text-5xl">👗</div>
          <p className="text-xl font-semibold text-white">No items found</p>
          <p className="text-[var(--color-text-muted)]">
            {activeGender === 'all'
              ? 'No listings match your criteria yet.'
              : `No ${activeTab?.label}'s items available yet. Be the first to list one!`}
          </p>
          <Link to="/listings/new" className="inline-block mt-3 btn-primary px-6 py-2.5 rounded-xl font-bold text-sm">
            + Add a Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const badge = GENDER_BADGE[item.gender] || GENDER_BADGE.unisex;
            return (
              <Link
                to={`/listings/${item._id}`}
                key={item._id}
                className="group glass-card rounded-3xl overflow-hidden hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-300 border border-white/5 block"
              >
                <div className="h-64 overflow-hidden relative bg-black/40">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 bg-[var(--color-primary)]/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-black text-white shadow-lg border border-white/20">
                    Est. ${item.estimatedValue}
                  </div>
                  {item.gender && item.gender !== 'unisex' && (
                    <div className={`absolute top-3 left-3 ${badge.bg} backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold ${badge.text} border ${badge.border}`}>
                      {badge.label}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2.5 relative z-10 bg-gradient-to-b from-transparent to-black/20">
                  <h3 className="font-bold text-lg text-white truncate">{item.title}</h3>
                  <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)]">
                    <span className="font-semibold bg-white/5 px-2 py-1 rounded-md">{item.brand}</span>
                    <span className="capitalize">{item.size} • {item.condition}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-[var(--color-text-muted)] pt-2.5 border-t border-white/10">
                    <MapPin size={13} className="text-[var(--color-secondary)]" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Listings;

