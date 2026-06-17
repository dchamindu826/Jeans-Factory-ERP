import React, { useState, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { 
  Calendar, 
  Download, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Wallet,
  Users
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Finance() {
  const { invoices, expenses, customers, settings } = useGlobalContext();
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');
  const reportRef = useRef(null);

  // Filter Data for Selected Month
  const currentInvoices = invoices.filter(inv => inv.date?.startsWith(selectedMonth));
  const currentExpenses = expenses.filter(exp => exp.date?.startsWith(selectedMonth));

  // Calculate Metrics
  const totalRevenue = currentInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0); // Ex. VAT
  const totalQty = currentInvoices.reduce((sum, inv) => sum + inv.items.reduce((qSum, item) => qSum + (item.qty || 0), 0), 0);
  const totalExpenses = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const grossProfit = totalRevenue - totalExpenses;

  // Prepare Data for Expense Pie Chart
  const expenseBreakdown = currentExpenses.reduce((acc, exp) => {
    const existing = acc.find(e => e.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  // Prepare Data for Revenue vs Expense Bar Chart
  const financeOverview = [
    { name: 'Revenue (Ex. VAT)', amount: totalRevenue, fill: '#10b981' },
    { name: 'Expenses', amount: totalExpenses, fill: '#ef4444' }
  ];

  // Customer Breakdown
  const customerBreakdown = customers.map(cust => {
    const custInvs = currentInvoices.filter(inv => inv.customerId === cust.id);
    const qty = custInvs.reduce((sum, inv) => sum + inv.items.reduce((qSum, item) => qSum + (item.qty || 0), 0), 0);
    const rev = custInvs.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return { name: cust.name, qty, revenue: rev };
  }).filter(c => c.qty > 0 || c.revenue > 0);

  // Export to Excel
  const exportToExcel = () => {
    const wsData = [
      ['FINANCIAL REPORT', '', selectedMonth],
      [],
      ['SUMMARY METRICS'],
      ['Total Revenue (Ex. VAT)', totalRevenue],
      ['Total Expenses', totalExpenses],
      ['Total Items Invoiced', totalQty],
      ['Gross Profit', grossProfit],
      [],
      ['EXPENSE BREAKDOWN'],
      ['Category', 'Amount (Rs.)'],
      ...expenseBreakdown.map(e => [e.name, e.value]),
      [],
      ['CUSTOMER BREAKDOWN'],
      ['Customer', 'Qty Invoiced', 'Revenue (Rs.)'],
      ...customerBreakdown.map(c => [c.name, c.qty, c.revenue])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance Report");
    XLSX.writeFile(wb, `Finance_Report_${selectedMonth.replace(' ', '_')}.xlsx`);
  };

  // Generate Image
  const handleShareReport = async () => {
    if (reportRef.current) {
      try {
        const canvas = await html2canvas(reportRef.current, { 
          scale: 2, 
          backgroundColor: '#0f172a', // slate-900 matching UI
          useCORS: true
        });
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Financial Report beautifully copied! Paste it directly into WhatsApp to share.');
          } catch (err) {
            console.error('Failed to copy', err);
            alert('Could not copy to clipboard. Ensure browser permissions are granted.');
          }
        });
      } catch (err) {
        console.error('Failed to generate image', err);
        alert('Failed to generate image report.');
      }
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      
      {/* Sidebar */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-card p-5 border-l-4 border-l-brand-500 flex flex-col h-full max-h-[600px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
            <Calendar className="w-5 h-5 text-brand-400" />
            Select Month
          </h3>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {months.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                  selectedMonth === month 
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-inner' 
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleShareReport} className="glass-button !py-4 flex items-center justify-center gap-3 !bg-blue-600 hover:!bg-blue-500 text-lg font-bold shadow-blue-500/30 group">
            <Share2 className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Copy Shareable Report
          </button>
          <button onClick={exportToExcel} className="glass-button !py-4 flex items-center justify-center gap-3 !bg-emerald-600/80 hover:!bg-emerald-500 font-bold">
            <Download className="w-5 h-5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Main Content Area / Shareable Report Capture Area */}
      <div className="flex-1 overflow-auto custom-scrollbar relative min-h-[800px] xl:min-h-0 bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800">
        {/* We need an inner container that html2canvas will target, allowing it to expand fully */}
        <div ref={reportRef} className="w-full min-h-max flex flex-col gap-6 p-4 md:p-8 bg-slate-900 text-white">
          
          <div className="flex justify-between items-end mb-4 border-b-2 border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-blue-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <PieChartIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Financial Report</h1>
              </div>
              <p className="text-brand-400 font-bold tracking-widest uppercase text-md ml-13 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {selectedMonth}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-white tracking-wider uppercase mb-1">Jeans Factory (PVT) LTD.</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Confidential Financial Summary</p>
            </div>
          </div>

          {/* Top Metrics Cards - High Contrast for Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 border-t-4 border-t-emerald-500 shadow-xl relative overflow-hidden">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-white mb-1">Rs. {totalRevenue.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">(Excl. VAT)</p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 border-t-4 border-t-red-500 shadow-xl relative overflow-hidden">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</p>
              <h3 className="text-3xl font-black text-white mb-1">Rs. {totalExpenses.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Payables</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 border-t-4 border-t-blue-500 shadow-xl relative overflow-hidden">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Items Invoiced</p>
              <h3 className="text-3xl font-black text-white mb-1">{totalQty.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Qty (Pcs)</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-900/40 border border-amber-500/30 rounded-2xl p-5 border-t-4 border-t-amber-500 shadow-xl relative overflow-hidden">
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {grossProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} 
                Gross Profit
              </p>
              <h3 className={`text-3xl font-black mb-1 ${grossProfit >= 0 ? 'text-amber-400' : 'text-red-500'}`}>
                Rs. {grossProfit.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Revenue - Expenses</p>
            </div>
          </div>

          {/* Two Column Layout for Detailed Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            
            {/* LEFT COLUMN - REVENUE & INVOICES */}
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 border-t-4 border-t-emerald-500 flex flex-col">
                <h3 className="w-full text-left font-black text-white text-lg tracking-wide uppercase flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Revenue & Customer Breakdown
                </h3>
                
                {/* Bar Chart */}
                <div className="h-[200px] w-full mb-6 min-h-0 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeOverview} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        formatter={(value) => `Rs. ${(value || 0).toLocaleString()}`}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={60}>
                        {financeOverview.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Customer Table */}
                <div className="flex-1 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/80 text-slate-300 text-[10px] uppercase tracking-widest border-b border-slate-700">
                        <th className="py-3 px-4 font-bold">Customer</th>
                        <th className="py-3 px-4 font-bold text-center">Qty (Pcs)</th>
                        <th className="py-3 px-4 font-bold text-right">Revenue (Ex.VAT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {customerBreakdown.map((cust, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white text-sm">{cust.name}</td>
                          <td className="py-3 px-4 text-center font-bold text-blue-300 text-sm">{cust.qty.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">Rs. {cust.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {customerBreakdown.length === 0 && (
                        <tr><td colSpan="3" className="py-6 text-center text-slate-500 text-sm">No revenue data.</td></tr>
                      )}
                      {customerBreakdown.length > 0 && (
                        <tr className="bg-slate-800/90 border-t-2 border-emerald-500/30">
                          <td className="py-3 px-4 font-black text-slate-300 text-right uppercase tracking-wider text-xs">Total:</td>
                          <td className="py-3 px-4 text-center font-black text-blue-400 text-sm">{totalQty.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">Rs. {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - EXPENSES */}
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 border-t-4 border-t-red-500 flex flex-col h-full">
                <h3 className="w-full text-left font-black text-white text-lg tracking-wide uppercase flex items-center gap-2 mb-6">
                  <TrendingDown className="w-5 h-5 text-red-400" /> Expense Analysis & Log
                </h3>

                {/* Pie Chart */}
                <div className="h-[200px] w-full mb-6 relative min-h-0 min-w-0">
                  {expenseBreakdown.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {expenseBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `Rs. ${(value || 0).toLocaleString()}`}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                          />
                          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 font-bold">No expenses recorded</div>
                  )}
                </div>

                {/* Expense List Table */}
                <div className="flex-1 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/80 text-slate-300 text-[10px] uppercase tracking-widest border-b border-slate-700">
                        <th className="py-3 px-4 font-bold">Date</th>
                        <th className="py-3 px-4 font-bold">Reason & Category</th>
                        <th className="py-3 px-4 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {currentExpenses.map((exp, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-400 font-medium text-xs">{exp.date}</td>
                          <td className="py-3 px-4">
                            <p className="text-white font-bold text-sm">{exp.reason}</p>
                            <p className="text-xs text-brand-400 font-bold uppercase tracking-wider">{exp.category}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-red-400 text-sm">Rs. {parseFloat(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {currentExpenses.length === 0 && (
                        <tr><td colSpan="3" className="py-6 text-center text-slate-500 text-sm">No expense logs.</td></tr>
                      )}
                      {currentExpenses.length > 0 && (
                        <tr className="bg-slate-800/90 border-t-2 border-red-500/30">
                          <td colSpan="2" className="py-3 px-4 font-black text-slate-300 text-right uppercase tracking-wider text-xs">Total Expenses:</td>
                          <td className="py-3 px-4 text-right font-black text-red-400 text-sm">Rs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
