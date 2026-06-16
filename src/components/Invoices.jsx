import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalContext';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  X,
  FileText,
  Save,
  Filter
} from 'lucide-react';

export default function Invoices() {
  const { API_URL } = useGlobalContext();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [months] = useState(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    qty: '',
    amount: ''
  });

  const fetchData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        axios.get(`${API_URL}/invoices`),
        axios.get(`${API_URL}/customers`)
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/invoices`, newInvoiceData);
      setIsAddOpen(false);
      setNewInvoiceData({ customerId: '', date: new Date().toISOString().split('T')[0], qty: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error("Error saving invoice:", err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this invoice?')) {
      try {
        await axios.delete(`${API_URL}/invoices/${id}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting invoice:", err);
      }
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (dateFilterStart && new Date(inv.date) < new Date(dateFilterStart)) return false;
      if (dateFilterEnd && new Date(inv.date) > new Date(dateFilterEnd)) return false;
      return true;
    });
  }, [invoices, dateFilterStart, dateFilterEnd]);

  const totalFilteredAmount = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
  const totalFilteredQty = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.qty) || 0), 0);

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-card p-5 border-l-4 border-l-brand-500 flex flex-col max-h-[350px]">
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

        <div className="glass-card p-5 border-l-4 border-l-orange-500">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-400" />
            Filter by Date
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Start Date</label>
              <input type="date" value={dateFilterStart} onChange={e => setDateFilterStart(e.target.value)} className="glass-input w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">End Date</label>
              <input type="date" value={dateFilterEnd} onChange={e => setDateFilterEnd(e.target.value)} className="glass-input w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
            {(dateFilterStart || dateFilterEnd) && (
              <button onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); }} className="text-xs text-orange-400 hover:underline w-full text-right mt-2 font-bold">Clear Filters</button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <h2 className="text-2xl font-bold text-white tracking-tight">Tax Invoices</h2>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Invoice
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col gap-4">
          {filteredInvoices.map(invoice => {
            const customer = customers.find(c => c._id === invoice.customerId || c._id === invoice.customerId?._id);
            return (
              <div key={invoice._id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{customer?.name || 'Unknown Customer'}</h4>
                    <div className="flex gap-3 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> {invoice.date}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Qty: {invoice.qty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-0.5">Amount</p>
                    <p className="text-emerald-400 font-black text-xl">Rs. {Number(invoice.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDelete(invoice._id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass-card w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Invoice</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSaveInvoice}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer</label>
                  <select 
                    value={newInvoiceData.customerId} 
                    onChange={e => setNewInvoiceData({...newInvoiceData, customerId: e.target.value})}
                    className="glass-input [&>option]:bg-slate-900"
                    required
                  >
                    <option value="">Select Customer...</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700/50">
                <button type="submit" className="glass-button !w-auto !py-3 !px-8 text-lg font-bold tracking-widest shadow-brand-500/40">
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
