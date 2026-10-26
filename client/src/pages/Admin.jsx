import React, { useState } from 'react';
import { Users, ShoppingBag, AlertTriangle, TrendingUp, Search, Trash2, CheckCircle } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Admin Sidebar */}
        <div className="w-full md:w-64 glass-card rounded-2xl p-4 flex flex-col h-fit border border-white/10">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-6 px-2">Admin Portal</h2>
          
          <nav className="space-y-2">
            <SidebarBtn icon={<TrendingUp size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarBtn icon={<Users size={18}/>} label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarBtn icon={<ShoppingBag size={18}/>} label="Manage Listings" active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} />
            <SidebarBtn icon={<AlertTriangle size={18}/>} label="Reports & Disputes" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          </nav>
        </div>

        {/* Admin Content */}
        <div className="flex-grow">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'listings' && <ManageListings />}
          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
};

const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30' : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const AdminDashboard = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Platform Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value="1,245" change="+12%" icon={<Users className="text-[var(--color-secondary)]"/>} />
      <StatCard title="Active Listings" value="3,892" change="+5%" icon={<ShoppingBag className="text-[var(--color-primary)]"/>} />
      <StatCard title="Successful Swaps" value="856" change="+24%" icon={<CheckCircle className="text-green-400"/>} />
      <StatCard title="Active Disputes" value="12" change="-2%" icon={<AlertTriangle className="text-red-400"/>} />
    </div>
    
    <div className="glass-card rounded-2xl p-6 border border-white/10 mt-6">
       <h4 className="text-lg font-bold text-white mb-4">Recent Activity</h4>
       <div className="space-y-4">
         {[1,2,3,4].map(i => (
           <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center space-x-3">
               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
               <p className="text-sm text-gray-300">User <span className="font-bold text-white">@sarah99</span> listed a new item: Vintage Levis</p>
             </div>
             <span className="text-xs text-gray-500">2 mins ago</span>
           </div>
         ))}
       </div>
    </div>
  </div>
);

const StatCard = ({ title, value, change, icon }) => (
  <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {change}
      </span>
    </div>
    <h4 className="text-2xl font-extrabold text-white">{value}</h4>
    <p className="text-sm text-[var(--color-text-muted)] font-medium mt-1">{title}</p>
  </div>
);

const ManageUsers = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-white">Manage Users</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search users..." className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-primary)]" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/5 border-b border-white/10 text-[var(--color-text-muted)] text-sm">
          <tr>
            <th className="p-3 rounded-tl-lg">User</th>
            <th className="p-3">Email</th>
            <th className="p-3">Status</th>
            <th className="p-3 rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-300 divide-y divide-white/5">
          {[1,2,3].map(i => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="p-3 font-medium text-white">Jane Doe</td>
              <td className="p-3 text-gray-400">jane.doe@example.com</td>
              <td className="p-3"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold">Active</span></td>
              <td className="p-3">
                <button className="text-red-400 hover:text-red-300 transition-colors flex items-center text-xs font-bold"><Trash2 size={14} className="mr-1"/> Suspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ManageListings = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-20 text-[var(--color-text-muted)]">
    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
    <h3 className="text-xl font-bold text-white mb-2">Listing Management</h3>
    <p>View, edit, or remove community listings here.</p>
  </div>
);

const Reports = () => (
  <div className="glass-card rounded-2xl p-6 border border-white/10 text-center py-20 text-[var(--color-text-muted)]">
    <AlertTriangle size={48} className="mx-auto mb-4 text-red-400/50" />
    <h3 className="text-xl font-bold text-white mb-2">Dispute Resolution</h3>
    <p>Handle reported items and user conflicts.</p>
  </div>
);

export default Admin;
