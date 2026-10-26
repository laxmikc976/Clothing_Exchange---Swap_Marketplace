import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Tag, ArrowRightLeft } from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [selectedMyItem, setSelectedMyItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/clothing/${id}`);
        setItem(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleOpenSwapModal = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.get('/clothing/user/me');
      setMyItems(res.data.filter(i => i.status === 'available'));
      setSwapModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestSwap = async () => {
    if (!selectedMyItem) return alert('Please select an item to offer');
    try {
      await api.post('/swaps', {
        receiverId: item.user._id,
        offeredItemId: selectedMyItem,
        requestedItemId: item._id
      });
      alert('Swap request sent successfully!');
      setSwapModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error sending swap request');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!item) return <div className="text-center py-20">Item not found</div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-lg">
        <div className="md:w-1/2 bg-gray-100">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover min-h-[400px]"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop" }}
          />
        </div>
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="flex-grow space-y-6">
            <div className="inline-block px-3 py-1 bg-green-100 text-[var(--color-primary)] rounded-full text-sm font-semibold capitalize">
              {item.type}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{item.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1"><Tag size={16} /><span>{item.brand}</span></div>
              <div className="flex items-center space-x-1"><MapPin size={16} /><span>{item.location}</span></div>
              <div className="font-semibold bg-gray-100 px-2 py-1 rounded">Size: {item.size}</div>
              <div className="font-semibold bg-gray-100 px-2 py-1 rounded">Condition: capitalize({item.condition})</div>
            </div>

            <div className="py-6 border-y border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description || 'No description provided.'}</p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Estimated Value</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]">${item.estimatedValue}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Listed by</p>
                <p className="font-semibold text-gray-900">{item.user?.name}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-auto">
            {user?._id === item.user?._id ? (
              <button disabled className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                This is your listing
              </button>
            ) : (
              <button onClick={handleOpenSwapModal} className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-all shadow-lg shadow-green-200">
                <ArrowRightLeft size={24} />
                <span>Request Swap</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {swapModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Propose a Swap</h2>
            <p className="text-gray-600 mb-6">Select an item from your wardrobe to offer in exchange for <strong>{item.title}</strong> (Est. ${item.estimatedValue}).</p>
            
            {myItems.length === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-red-500 font-medium">You don't have any available items to offer.</p>
                <button onClick={() => navigate('/listings/new')} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-xl">Add an Item</button>
                <button onClick={() => setSwapModalOpen(false)} className="text-gray-500 block w-full pt-2">Cancel</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Item</label>
                  <select 
                    value={selectedMyItem} 
                    onChange={(e) => setSelectedMyItem(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">-- Choose an item --</option>
                    {myItems.map(myI => (
                      <option key={myI._id} value={myI._id}>
                        {myI.title} (Est. ${myI.estimatedValue})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setSwapModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleRequestSwap} className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md">
                    Send Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
