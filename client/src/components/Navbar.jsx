import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shirt, LogOut, User, PlusCircle, MessageCircle, ArrowRightLeft, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 shadow-sm transition-all duration-300 border-b border-white/10 relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 font-black text-2xl hover:scale-[1.02] transition-transform group">
          <div className="bg-[var(--color-primary)] p-1.5 rounded-xl group-hover:rotate-12 transition-transform">
            <Shirt className="text-white" size={24} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] animate-gradient-x">
            SwapStyle
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/listings" className="text-[var(--color-text-muted)] hover:text-white font-semibold transition-colors text-sm">Browse</Link>
          {user ? (
            <>
              <Link to="/requests" className="text-[var(--color-text-muted)] hover:text-white font-semibold flex items-center space-x-1 transition-colors text-sm" title="Swap Requests">
                <ArrowRightLeft size={18} />
              </Link>
              <Link to="/chat" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-semibold flex items-center space-x-1 transition-colors text-sm" title="Messages">
                <MessageCircle size={18} />
              </Link>
              <Link to="/listings/new" className="text-[var(--color-text-muted)] hover:text-white font-semibold flex items-center space-x-1 transition-colors text-sm">
                <PlusCircle size={18} />
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5 group">
                <div className="bg-[var(--color-primary)]/20 p-1 rounded-full group-hover:bg-[var(--color-primary)] transition-colors">
                  <User size={14} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
                </div>
                <span className="text-white font-bold text-sm">{user.name}</span>
              </Link>
              <Link to="/admin" className="text-[var(--color-accent)] hover:text-red-400 font-semibold flex items-center space-x-1 transition-colors text-sm" title="Admin">
                <ShieldAlert size={18} />
              </Link>
              <button onClick={handleLogout} className="text-[var(--color-text-muted)] hover:text-red-400 flex items-center transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[var(--color-text-muted)] hover:text-white font-semibold transition-colors text-sm">Log In</Link>
              <Link to="/register" className="btn-primary px-5 py-2 rounded-full font-bold text-sm transition-all duration-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
