import React from 'react';
import { TrendingUp, Users, Factory, ArrowUpRight, ArrowDownRight, Package, Droplet, Zap } from 'lucide-react';

export default function Overview() {
  const stats = [
    { title: 'Total Production', value: '12,450', unit: 'pcs', change: '+14%', isPositive: true, icon: Factory, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { title: 'Active Wash Batches', value: '84', unit: '', change: '+5%', isPositive: true, icon: Droplet, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Total Staff Present', value: '142', unit: '/ 150', change: '-2%', isPositive: false, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-400 mt-2 text-lg">Welcome back. Here's what's happening at the washing plant today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-slate-400 font-medium mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-white tracking-tight">{stat.value}</h3>
                <span className="text-slate-400 font-medium">{stat.unit}</span>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-sm font-semibold ${stat.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change} <span className="text-slate-500 font-normal ml-1">from last week</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl border border-white/5 ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Production Flow</h3>
            <button className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">View Report</button>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center border border-dashed border-slate-700/50 rounded-xl bg-slate-800/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-center relative z-10">
              <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <span className="text-slate-400 font-medium">Interactive Charts will be integrated here</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-5">
            {[
              { text: "Batch #1042 Denim Wash complete", time: "10 mins ago", color: "bg-emerald-500", shadow: "shadow-emerald-500/50" },
              { text: "New chemical supplier added", time: "1 hour ago", color: "bg-brand-500", shadow: "shadow-brand-500/50" },
              { text: "Maintenance required on Machine A", time: "3 hours ago", color: "bg-amber-500", shadow: "shadow-amber-500/50" },
              { text: "Payroll approved for May", time: "5 hours ago", color: "bg-purple-500", shadow: "shadow-purple-500/50" },
              { text: "Invoice #INV-2041 generated", time: "1 day ago", color: "bg-blue-500", shadow: "shadow-blue-500/50" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className={`w-2.5 h-2.5 mt-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0)] ${item.shadow}`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
