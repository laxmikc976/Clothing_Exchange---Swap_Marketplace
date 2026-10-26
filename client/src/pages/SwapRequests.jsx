import React from 'react';
import { ArrowRightLeft, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const SwapRequests = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center">
          <ArrowRightLeft className="mr-3 text-[var(--color-primary)]" size={32} />
          Swap Requests
        </h1>
        <div className="bg-white/10 p-1 rounded-lg flex text-sm">
          <button className="px-4 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-md shadow-lg">Incoming</button>
          <button className="px-4 py-2 text-[var(--color-text-muted)] hover:text-white transition-colors">Sent</button>
        </div>
      </div>

      <div className="space-y-4">
        <RequestCard 
          id={1}
          user="Alex Johnson"
          myListing="Vintage Denim Jacket"
          theirListing="Zara Trench Coat"
          match="95%"
          status="pending"
          time="2 hours ago"
        />
        <RequestCard 
          id={2}
          user="Sam Smith"
          myListing="Nike Air Force 1"
          theirListing="Adidas Hoodie + $10"
          match="80%"
          status="accepted"
          time="1 day ago"
        />
      </div>
    </div>
  );
};

const RequestCard = ({ id, user, myListing, theirListing, match, status, time }) => (
  <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      
      {/* Swap Info */}
      <div className="flex-grow">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-bold text-white bg-white/10 px-2 py-1 rounded border border-white/5">{user}</span>
          <span className="text-xs text-[var(--color-text-muted)] flex items-center"><Clock size={12} className="mr-1"/> {time}</span>
        </div>
        
        <div className="flex items-center space-x-4 bg-black/20 p-3 rounded-xl border border-white/5">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">They Want</p>
            <p className="font-semibold text-white truncate">{myListing}</p>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            <ArrowRightLeft className="text-[var(--color-primary)] mb-1" size={20} />
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{match} Match</span>
          </div>

          <div className="flex-1 text-center md:text-right">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">They Offer</p>
            <p className="font-semibold text-white truncate">{theirListing}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col justify-end gap-2 shrink-0 md:w-32">
        {status === 'pending' ? (
          <>
            <button className="flex-1 md:flex-none btn-primary py-2 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center">
              <Check size={16} className="mr-1" /> Accept
            </button>
            <button className="flex-1 md:flex-none bg-red-500/10 text-red-400 py-2 rounded-xl text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center">
              <X size={16} className="mr-1" /> Decline
            </button>
            <Link to={`/chat`} className="flex-1 md:flex-none bg-white/5 text-white py-2 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors text-center mt-1">
              Negotiate
            </Link>
          </>
        ) : (
          <div className="w-full text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20">
              <Check size={12} className="mr-1" /> Accepted
            </span>
            <Link to={`/chat`} className="block w-full bg-white/5 text-white py-2 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors text-center mt-3">
              Open Chat
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SwapRequests;
