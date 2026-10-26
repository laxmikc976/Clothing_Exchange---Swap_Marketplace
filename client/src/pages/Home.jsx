import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCcw, MapPin, Handshake } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-16 animate-fade-in-up pb-10">
      <div className="space-y-8 max-w-4xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-primary)] opacity-20 blur-[100px] rounded-full -z-10 animate-float"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--color-secondary)] opacity-20 blur-[80px] rounded-full -z-10 animate-float" style={{animationDelay: '2s'}}></div>
        
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
          Revamp Your Wardrobe, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] animate-gradient-x">
            Sustainably.
          </span>
        </h1>
        <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto font-light leading-relaxed">
          Join the clothing exchange revolution. Swap the clothes you no longer wear for something fresh. Zero money, zero waste, 100% style.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
          <Link to="/listings" className="btn-primary px-10 py-4 rounded-full font-bold text-lg flex items-center space-x-2 w-full sm:w-auto justify-center">
            <span>Explore Listings</span>
            <ArrowRight size={20} />
          </Link>
          <Link to="/register" className="glass px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all text-white w-full sm:w-auto justify-center">
            Join the Community
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pt-16">
        <FeatureCard 
          icon={<RefreshCcw size={40} className="text-[var(--color-primary)]" />}
          title="Swap, Don't Shop"
          desc="Exchange your pre-loved clothes for new finds without spending a dime. Support a circular economy."
        />
        <FeatureCard 
          icon={<MapPin size={40} className="text-[var(--color-secondary)]" />}
          title="Local Matching"
          desc="Find swap partners near you to save on shipping and reduce your carbon footprint."
        />
        <FeatureCard 
          icon={<Handshake size={40} className="text-[var(--color-accent)]" />}
          title="Fair Trades"
          desc="Our estimated value calculator helps ensure every swap is fair and transparent."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center space-y-5 hover:scale-[1.02] transition-transform duration-300">
    <div className="bg-white/10 p-5 rounded-2xl shadow-inner backdrop-blur-md border border-white/5">{icon}</div>
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
  </div>
);

export default Home;
