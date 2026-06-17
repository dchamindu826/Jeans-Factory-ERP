import React, { useMemo } from 'react';
import { TrendingUp, Users, Factory, ArrowUpRight, ArrowDownRight, Package, Droplet, Zap, DollarSign } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Overview() {
  const { productionLogs, staff, invoices, expenses } = useGlobalContext();

  // Stats Calculations
  const stats = useMemo(() => {
    // Total Production Qty
    const totalProduction = productionLogs.reduce((sum, log) => sum + (parseFloat(log.qty) || 0), 0);
    
    // Total Income
    const totalIncome = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    // Total Expenses
    const totalExpense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Active Wash Batches (In Progress)
    const activeBatches = productionLogs.filter(log => log.status === 'Processing').length;

    return [
      { title: 'Total Production', value: totalProduction.toLocaleString(), unit: 'pcs', icon: Factory, color: 'text-brand-400', bg: 'bg-brand-500/10' },
      { title: 'Gross Income', value: `Rs. ${(totalIncome / 1000).toFixed(1)}k`, unit: '', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { title: 'Total Expenses', value: `Rs. ${(totalExpense / 1000).toFixed(1)}k`, unit: '', icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10' },
      { title: 'Total Staff', value: staff.length.toString(), unit: 'members', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];
  }, [productionLogs, invoices, expenses, staff]);

  // Chart Data Calculations
  const chartData = useMemo(() => {
    // We will group data by the last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
      last6Months.push(monthStr);
    }

    return last6Months.map(month => {
      // Income for this month
      const mIncomes = invoices.filter(inv => inv.date && inv.date.startsWith(month));
      const income = mIncomes.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

      // Expenses for this month
      const mExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(month));
      const expense = mExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      // Production for this month
      const mProd = productionLogs.filter(prod => prod.date && prod.date.startsWith(month));
      const production = mProd.reduce((sum, prod) => sum + (parseFloat(prod.qty) || 0), 0);

      return {
        name: month,
        Income: income,
        Expense: expense,
        Profit: income - expense,
        Production: production
      };
    });
  }, [invoices, expenses, productionLogs]);

  // Recent Activity Calculations
  const recentActivities = useMemo(() => {
    const activities = [
      ...invoices.map(i => ({ type: 'Invoice', date: new Date(i.createdAt || i.date), desc: `Invoice created for Rs. ${i.amount}`, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' })),
      ...expenses.map(e => ({ type: 'Expense', date: new Date(e.createdAt || e.date), desc: `${e.category} expense: Rs. ${e.amount}`, color: 'bg-red-500', shadow: 'shadow-red-500/50' })),
      ...productionLogs.map(p => ({ type: 'Production', date: new Date(p.createdAt || p.date), desc: `Batch ${p.batchNumber || p._id.slice(-4)} processing`, color: 'bg-brand-500', shadow: 'shadow-brand-500/50' }))
    ];

    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 5)
      .map(a => ({
        ...a,
        time: a.date.toLocaleDateString()
      }));
  }, [invoices, expenses, productionLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-400 mt-2 text-lg">Welcome back. Here's your real-time factory analytics.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300 border-t-2" style={{ borderTopColor: stat.bg.includes('brand') ? '#3b82f6' : stat.bg.includes('emerald') ? '#10b981' : stat.bg.includes('red') ? '#ef4444' : '#a855f7' }}>
            <div>
              <p className="text-slate-400 font-medium mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                <span className="text-slate-400 font-medium text-sm">{stat.unit}</span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl border border-white/5 ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[450px]">
          <h3 className="text-xl font-bold text-white mb-6">Financial Overview (Income vs Expense)</h3>
          <div className="flex-1 w-full h-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 h-[450px] overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {recentActivities.length > 0 ? recentActivities.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={`w-3 h-3 mt-1.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0)] ${item.shadow} group-hover:scale-125 transition-transform`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{item.type}</span>
                    <span className="text-xs text-slate-400">• {item.time}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                <Package className="w-10 h-10 opacity-20" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="lg:col-span-3 glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Production Output Trends</h3>
          <div className="flex-1 w-full h-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '8px', color: '#fff', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Production" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 3, r: 6 }} activeDot={{ r: 8, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
