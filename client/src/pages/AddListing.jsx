import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AddListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'tops',
    brand: '',
    size: '',
    condition: 'good',
    estimatedValue: '',
    location: user?.location || '',
    imageUrl: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clothing', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to add listing', error);
      alert('Error creating listing');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in-up">
      <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]"></div>
        <h2 className="text-3xl font-extrabold text-white mb-8 mt-2">List an Item for Swap</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-white mb-2">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="E.g., Vintage Levi's Denim Jacket" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Category</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white transition-all">
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="outerwear">Outerwear</option>
                <option value="accessories">Accessories</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Brand</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="Levi's, Zara, etc." />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Size</label>
              <input type="text" name="size" required value={formData.size} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="M, 32, One Size" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white transition-all">
                <option value="new">New with tags</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Estimated Value ($)</label>
              <input type="number" name="estimatedValue" required value={formData.estimatedValue} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="50" min="1" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Location</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="City, State" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-white mb-2">Image URL</label>
              <input type="url" name="imageUrl" required value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="https://example.com/image.jpg" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-white mb-2">Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white placeholder-gray-500 transition-all" placeholder="Tell us more about the item..."></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary px-10 py-3.5 rounded-xl font-bold shadow-lg text-lg">
              Post Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListing;
