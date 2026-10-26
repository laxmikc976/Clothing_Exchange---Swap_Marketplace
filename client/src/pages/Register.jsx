import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, location);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 glass-card p-8 md:p-10 rounded-3xl shadow-2xl animate-fade-in-up border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-secondary)] opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="flex justify-center mb-6">
        <div className="bg-[var(--color-primary)]/20 p-3 rounded-2xl border border-[var(--color-primary)]/30">
          <Shirt className="text-[var(--color-primary)]" size={32} />
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-center text-white mb-8">Join SwapStyle</h2>
      
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-center text-sm font-bold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className="block text-sm font-bold text-white mb-2">Full Name</label>
          <input 
            type="text" 
            required 
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">Email Address</label>
          <input 
            type="email" 
            required 
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">Password</label>
          <input 
            type="password" 
            required 
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">Location (City, State)</label>
          <input 
            type="text" 
            required 
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="New York, NY"
          />
        </div>
        <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-bold shadow-lg mt-4 text-lg">
          Create Account
        </button>
      </form>
      <p className="mt-8 text-center text-[var(--color-text-muted)] text-sm">
        Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:text-white transition-colors">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
