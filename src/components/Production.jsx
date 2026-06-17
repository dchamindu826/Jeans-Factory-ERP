import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Copy, 
  Factory,
  Droplet,
  Settings,
  ChevronLeft
} from 'lucide-react';

export default function Production() {
  const { customers, productionLogs, setProductionLogs, settings, updateSettings, API_URL, fetchAllData } = useGlobalContext();
  
  // Toggle between Employee Data Entry & Management Dashboard
  const [viewMode, setViewMode] = useState('employee'); // 'employee' | 'manager'

  // Settings for process types & styles
  const dryProcessTypes = settings?.dryProcessTypes || ['Whiskers', 'Scraping', 'Grinding', 'Tacking', 'Destroying'];
  const washProcessTypes = settings?.washProcessTypes || ['Enzyme Wash', 'Bleach Wash', 'Stone Wash', 'Acid Wash', 'Tinting'];
  const savedStyles = settings?.savedStyles || ['STY-1001', 'STY-1002'];

  // Employee View State
  const [activeCategory, setActiveCategory] = useState(null); // 'dry' | 'wash'
  
  // Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryCustomer, setEntryCustomer] = useState('');
  const [entryStyle, setEntryStyle] = useState('');
  const [entryProcess, setEntryProcess] = useState('');
  const [entryQty, setEntryQty] = useState('');
  const [editingProdId, setEditingProdId] = useState(null);

  // Type Management State
  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [newType, setNewType] = useState('');

  const dryCardRef = useRef(null);
  const washCardRef = useRef(null);

  useEffect(() => {
    if (customers.length > 0 && !entryCustomer) {
      setEntryCustomer(customers[0]._id);
    }
  }, [customers]);

  // Handlers
  const handleSaveProduction = async (e) => {
    e.preventDefault();
    
    const productionData = {
      date: entryDate,
      category: activeCategory,
      customerId: entryCustomer,
      style: entryStyle,
      process: entryProcess,
      qty: parseInt(entryQty, 10)
    };

    try {
      if (editingProdId) {
        await axios.put(`${API_URL}/production/${editingProdId}`, productionData);
        setEditingProdId(null);
      } else {
        await axios.post(`${API_URL}/production`, productionData);
        
        // Save style for quick access if not exists
        if (entryStyle && !savedStyles.includes(entryStyle)) {
          updateSettings({ ...settings, savedStyles: [...savedStyles, entryStyle] });
        }
      }
      
      fetchAllData(); // Refresh logs

      // Reset fields except date and customer
      setEntryStyle('');
      setEntryQty('');
      setEntryProcess('');
      setActiveCategory(null); // Go back to main choice
    } catch (err) {
      console.error("Failed to save production", err);
      alert("Failed to save production log.");
    }
  };

  const handleEditProd = (prod) => {
    setActiveCategory(prod.category);
    setEditingProdId(prod._id);
    setEntryDate(prod.date);
    setEntryCustomer(prod.customerId?._id || prod.customerId);
    setEntryStyle(prod.style);
    setEntryProcess(prod.process);
    setEntryQty(prod.qty.toString());
  };

  const handleDeleteProd = async (id) => {
    if(window.confirm('Are you sure you want to delete this production entry?')) {
      try {
        await axios.delete(`${API_URL}/production/${id}`);
        fetchAllData();
      } catch (err) {
        console.error("Failed to delete production", err);
      }
    }
  };

  const handleAddType = () => {
    if (newType.trim()) {
      if (activeCategory === 'dry' && !dryProcessTypes.includes(newType.trim())) {
        updateSettings({ ...settings, dryProcessTypes: [...dryProcessTypes, newType.trim()] });
      } else if (activeCategory === 'wash' && !washProcessTypes.includes(newType.trim())) {
        updateSettings({ ...settings, washProcessTypes: [...washProcessTypes, newType.trim()] });
      }
      setNewType('');
    }
  };

  const handleDeleteType = (type) => {
    if (activeCategory === 'dry') {
      updateSettings({ ...settings, dryProcessTypes: dryProcessTypes.filter(t => t !== type) });
    } else {
      updateSettings({ ...settings, washProcessTypes: washProcessTypes.filter(t => t !== type) });
    }
  };

  const handleCopyCard = async (ref, name) => {
    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, { backgroundColor: '#0f172a' });
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            alert(`${name} summary copied to clipboard!`);
          } catch (err) {
            alert('Failed to copy to clipboard.');
          }
        });
      } catch (err) {
        alert('Failed to generate image.');
      }
    }
  };

  const todaysProductions = productionLogs.filter(p => p.date === new Date().toISOString().split('T')[0]);
  const dryTotal = todaysProductions.filter(p => p.category === 'dry').reduce((sum, p) => sum + p.qty, 0);
  const washTotal = todaysProductions.filter(p => p.category === 'wash').reduce((sum, p) => sum + p.qty, 0);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      
      {/* Top Toggle & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {viewMode === 'employee' ? <Factory className="text-brand-400" /> : <Settings className="text-purple-400" />}
          Production Module
        </h1>
        
        <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700/50">
          <button 
            onClick={() => { setViewMode('employee'); setActiveCategory(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'employee' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Employee View
          </button>
          <button 
            onClick={() => setViewMode('manager')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'manager' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Manager Dashboard
          </button>
        </div>
      </div>

      {/* ---------------- EMPLOYEE VIEW ---------------- */}
      {viewMode === 'employee' && (
        <div className="flex-1 overflow-y-auto pb-20 sm:pb-0">
          {!activeCategory ? (
            // Category Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-10">
              <button 
                onClick={() => { setActiveCategory('dry'); setEntryProcess(dryProcessTypes[0] || ''); }}
                className="glass-card group flex flex-col items-center justify-center p-12 hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              >
                <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Factory className="w-12 h-12 text-brand-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-wider">DRY PROCESS</h2>
                <p className="text-slate-400 mt-2 text-center">Log whiskers, scraping, grinding, etc.</p>
              </button>
              
              <button 
                onClick={() => { setActiveCategory('wash'); setEntryProcess(washProcessTypes[0] || ''); }}
                className="glass-card group flex flex-col items-center justify-center p-12 hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              >
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Droplet className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-wider">WASH TYPE</h2>
                <p className="text-slate-400 mt-2 text-center">Log enzyme, bleach, stone washes, etc.</p>
              </button>
            </div>
          ) : (
            // Data Entry Form
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 glass-card p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700/50">
                  <button onClick={() => { setActiveCategory(null); setEditingProdId(null); }} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    {activeCategory === 'dry' ? <Factory className="text-brand-400" /> : <Droplet className="text-blue-400" />}
                    {activeCategory === 'dry' ? 'Dry Process Entry' : 'Wash Type Entry'}
                  </h2>
                </div>

                <form onSubmit={handleSaveProduction} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                      <input type="date" required value={entryDate} onChange={e => setEntryDate(e.target.value)} className="glass-input [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer</label>
                      <select required value={entryCustomer} onChange={e => setEntryCustomer(e.target.value)} className="glass-input [&>option]:bg-slate-900">
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        {customers.length === 0 && <option value="" disabled>No customers found</option>}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Style Number</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" required value={entryStyle} onChange={e => setEntryStyle(e.target.value)} placeholder="Type Style No..." className="glass-input flex-1 uppercase" />
                        
                        {/* Quick Select Styles */}
                        {savedStyles.length > 0 && (
                          <div className="flex flex-wrap gap-2 sm:w-1/2 items-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold w-full sm:w-auto">Quick Select:</span>
                            {savedStyles.map(s => (
                              <button key={s} type="button" onClick={() => setEntryStyle(s)} className="px-3 py-1 bg-slate-800 hover:bg-brand-600 rounded-full text-xs font-bold text-slate-300 transition-colors border border-slate-700">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-slate-300">Process Type</label>
                        <button type="button" onClick={() => setIsManagingTypes(!isManagingTypes)} className="text-xs text-brand-400 hover:underline">Manage Types</button>
                      </div>
                      <select required value={entryProcess} onChange={e => setEntryProcess(e.target.value)} className="glass-input [&>option]:bg-slate-900">
                        <option value="" disabled>Select Process</option>
                        {(activeCategory === 'dry' ? dryProcessTypes : washProcessTypes).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity (Pcs)</label>
                      <input type="number" required min="1" value={entryQty} onChange={e => setEntryQty(e.target.value)} placeholder="0" className="glass-input font-bold text-lg" />
                    </div>
                  </div>

                  {isManagingTypes && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-2">
                      <div className="flex gap-2 mb-4">
                        <input type="text" value={newType} onChange={e => setNewType(e.target.value)} placeholder="New Process Name..." className="glass-input !py-1 text-sm flex-1" />
                        <button type="button" onClick={handleAddType} className="glass-button !w-auto !py-1 !px-3 text-sm"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(activeCategory === 'dry' ? dryProcessTypes : washProcessTypes).map(t => (
                          <div key={t} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-sm text-slate-300">
                            {t} <button type="button" onClick={() => handleDeleteType(t)} className="text-red-400 hover:text-red-300 ml-1"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="glass-button w-full !py-4 text-lg font-bold tracking-widest uppercase mt-4">
                    {editingProdId ? 'Update Production' : 'Save Production'}
                  </button>
                </form>
              </div>

              {/* Today's Entries Sidebar */}
              <div className="w-full lg:w-96 flex flex-col gap-4">
                <div className="glass-card p-5 h-full flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2">Today's Entries ({todaysProductions.length})</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {todaysProductions.map(p => {
                      const customerName = customers.find(c => c._id === (p.customerId?._id || p.customerId))?.name || 'Unknown';
                      return (
                      <div key={p._id} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 relative group">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${p.category === 'dry' ? 'bg-brand-500/20 text-brand-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {p.category}
                          </span>
                          <span className="text-lg font-black text-white">{p.qty} <span className="text-xs text-slate-500 font-normal">pcs</span></span>
                        </div>
                        <div className="text-sm font-bold text-slate-300">{customerName} - {p.style}</div>
                        <div className="text-xs text-slate-500">{p.process}</div>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 p-1 rounded shadow-lg">
                          <button onClick={() => handleEditProd(p)} className="p-1 text-amber-400 hover:bg-amber-400/20 rounded"><Edit className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteProd(p._id)} className="p-1 text-red-400 hover:bg-red-400/20 rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )})}
                    {todaysProductions.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-8">No productions logged today yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MANAGER DASHBOARD VIEW ---------------- */}
      {viewMode === 'manager' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative pb-10">
          
          <div className="pt-2 pb-6 px-2">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Daily Production Summary</h2>
              <p className="text-brand-400 font-bold mt-1 text-lg">{new Date().toISOString().split('T')[0]}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dry Process Card */}
              <div ref={dryCardRef} className="glass-card p-6 border-t-4 border-t-brand-500 bg-slate-900/80 relative">
                <button 
                  onClick={() => handleCopyCard(dryCardRef, 'Dry Process')}
                  className="absolute top-4 right-4 glass-button !w-auto !py-1 !px-3 z-20 flex items-center gap-1 text-xs !bg-blue-600 hover:!bg-blue-500 !shadow-none rounded-lg"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <div className="flex justify-between items-end mb-6 border-b border-slate-700/50 pb-4 pr-20">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-500/20 rounded-xl"><Factory className="w-6 h-6 text-brand-400" /></div>
                    <h3 className="text-xl font-bold text-white uppercase">Dry Process</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total</p>
                    <p className="text-3xl font-black text-brand-400">{dryTotal.toLocaleString()}</p>
                  </div>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                      <th className="pb-2 font-bold">Style / Customer</th>
                      <th className="pb-2 font-bold">Process</th>
                      <th className="pb-2 font-bold text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {todaysProductions.filter(p => p.category === 'dry').map(p => {
                      const customerName = customers.find(c => c._id === (p.customerId?._id || p.customerId))?.name || 'Unknown';
                      return (
                      <tr key={p._id}>
                        <td className="py-3">
                          <p className="font-bold text-slate-200">{p.style}</p>
                          <p className="text-xs text-slate-500">{customerName}</p>
                        </td>
                        <td className="py-3 text-sm text-slate-300">{p.process}</td>
                        <td className="py-3 font-bold text-right text-brand-300">{p.qty.toLocaleString()}</td>
                      </tr>
                    )})}
                    {dryTotal === 0 && <tr><td colSpan="3" className="py-6 text-center text-slate-500 text-sm">No dry process entries today.</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Wash Type Card */}
              <div ref={washCardRef} className="glass-card p-6 border-t-4 border-t-blue-500 bg-slate-900/80 relative">
                <button 
                  onClick={() => handleCopyCard(washCardRef, 'Wash Type')}
                  className="absolute top-4 right-4 glass-button !w-auto !py-1 !px-3 z-20 flex items-center gap-1 text-xs !bg-blue-600 hover:!bg-blue-500 !shadow-none rounded-lg"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <div className="flex justify-between items-end mb-6 border-b border-slate-700/50 pb-4 pr-20">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl"><Droplet className="w-6 h-6 text-blue-400" /></div>
                    <h3 className="text-xl font-bold text-white uppercase">Wash Type</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total</p>
                    <p className="text-3xl font-black text-blue-400">{washTotal.toLocaleString()}</p>
                  </div>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                      <th className="pb-2 font-bold">Style / Customer</th>
                      <th className="pb-2 font-bold">Process</th>
                      <th className="pb-2 font-bold text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {todaysProductions.filter(p => p.category === 'wash').map(p => {
                      const customerName = customers.find(c => c._id === (p.customerId?._id || p.customerId))?.name || 'Unknown';
                      return (
                      <tr key={p._id}>
                        <td className="py-3">
                          <p className="font-bold text-slate-200">{p.style}</p>
                          <p className="text-xs text-slate-500">{customerName}</p>
                        </td>
                        <td className="py-3 text-sm text-slate-300">{p.process}</td>
                        <td className="py-3 font-bold text-right text-blue-300">{p.qty.toLocaleString()}</td>
                      </tr>
                    )})}
                    {washTotal === 0 && <tr><td colSpan="3" className="py-6 text-center text-slate-500 text-sm">No wash entries today.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
