import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  X,
  FileText
} from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

export default function GatePass() {
  const { gatePasses, customers, settings, API_URL, fetchAllData } = useGlobalContext();
  
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');
  
  const [selectedCustomer, setSelectedCustomer] = useState('All Customers');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [gpDate, setGpDate] = useState(new Date().toISOString().split('T')[0]);
  const [gpCustomer, setGpCustomer] = useState('');
  const [gpNo, setGpNo] = useState(`GP-${2000 + gatePasses.length + 1}`);
  
  const [gpItems, setGpItems] = useState([{ name: '', qty: '' }]);

  useEffect(() => {
    if (customers.length > 0 && !gpCustomer) {
      setGpCustomer(customers[0]._id);
    }
  }, [customers]);

  const handleAddItemRow = () => {
    setGpItems([...gpItems, { name: '', qty: '' }]);
  };

  const handleRemoveItemRow = (index) => {
    setGpItems(gpItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...gpItems];
    newItems[index][field] = value;
    setGpItems(newItems);
  };

  const handleSaveGatePass = async (e) => {
    e.preventDefault();
    const validItems = gpItems.filter(i => i.name.trim() && i.qty);
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const newGp = {
      date: gpDate,
      passNo: gpNo,
      customerId: gpCustomer,
      items: validItems.map(i => ({ name: i.name, qty: parseInt(i.qty, 10) }))
    };

    try {
      await axios.post(`${API_URL}/gatepasses`, newGp);
      setIsCreateOpen(false);
      setGpItems([{ name: '', qty: '' }]);
      setGpNo(`GP-${2000 + gatePasses.length + 2}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to save gate pass.");
    }
  };

  const handleDeleteGatePass = async (id) => {
    if (window.confirm("Delete this gate pass?")) {
      try {
        await axios.delete(`${API_URL}/gatepasses/${id}`);
        fetchAllData();
      } catch (err) {
        console.error(err);
      }
    }
  }

  const filteredGatePasses = gatePasses.filter(gp => {
    const monthMatch = gp.date && gp.date.startsWith(selectedMonth);
    const customerMatch = selectedCustomer === 'All Customers' || gp.customerId === selectedCustomer || gp.customerId?._id === selectedCustomer;
    return monthMatch && customerMatch;
  });

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      
      {/* Left Sidebar */}
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

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Filter by Customer
          </h3>
          <select 
            value={selectedCustomer} 
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="glass-input w-full [&>option]:bg-slate-900"
          >
            <option value="All Customers">All Customers</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-[600px] xl:min-h-0">
        <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <h2 className="text-2xl font-bold text-white tracking-tight">Gate Passes</h2>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Gate Pass
          </button>
        </div>

        <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-auto custom-scrollbar p-5 space-y-4">
            {filteredGatePasses.map(gp => {
              const customer = customers.find(c => c._id === (gp.customerId?._id || gp.customerId)) || { name: 'Unknown' };
              return (
              <div key={gp._id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors group">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-700/50 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{gp.passNo}</h3>
                    <p className="text-slate-400 text-sm mt-1">{gp.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-brand-500/20 text-brand-300 font-bold rounded-lg text-sm border border-brand-500/30">
                      {customer.name}
                    </span>
                    <button onClick={() => handleDeleteGatePass(gp._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-700/50">
                      <th className="pb-2 font-bold">Item Description</th>
                      <th className="pb-2 font-bold text-right w-32">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {gp.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-slate-300 font-medium">{item.name}</td>
                        <td className="py-2 text-right text-emerald-400 font-bold">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )})}
            {filteredGatePasses.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg font-medium">No gate passes found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-2xl p-8 relative border-t-4 border-t-brand-500 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Create Gate Pass</h2>
            
            <form onSubmit={handleSaveGatePass} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                  <input type="date" required value={gpDate} onChange={e => setGpDate(e.target.value)} className="glass-input [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Gate Pass No</label>
                  <input type="text" required value={gpNo} onChange={e => setGpNo(e.target.value)} className="glass-input font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</label>
                  <select required value={gpCustomer} onChange={e => setGpCustomer(e.target.value)} className="glass-input [&>option]:bg-slate-900">
                    <option value="" disabled>Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white font-bold tracking-wide">Items List</h4>
                  <button type="button" onClick={handleAddItemRow} className="text-xs bg-brand-500/20 text-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-500/30 flex items-center gap-1 font-bold">
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                
                <div className="space-y-3">
                  {gpItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input type="text" required placeholder="Item description" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="glass-input" />
                      </div>
                      <div className="w-32">
                        <input type="number" required min="1" placeholder="Qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} className="glass-input font-bold" />
                      </div>
                      <button type="button" onClick={() => handleRemoveItemRow(idx)} disabled={gpItems.length === 1} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors disabled:opacity-50 mt-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="glass-button w-full !py-4 text-lg font-bold tracking-widest uppercase shadow-brand-500/40">
                Save Gate Pass
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
