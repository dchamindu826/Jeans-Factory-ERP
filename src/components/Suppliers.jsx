import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit, X, Wallet, FileText, Upload } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import axios from 'axios';

export default function Suppliers() {
  const { suppliers, setSuppliers, expenses, payments, API_URL, settings } = useGlobalContext();
  
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?._id || null);
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppTel, setNewSuppTel] = useState('');
  const [newSuppAddress, setNewSuppAddress] = useState('');

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invAmount, setInvAmount] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invRemark, setInvRemark] = useState('');

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRef, setPaymentRef] = useState('');

  const activeSupplier = suppliers.find(s => s._id === selectedSupplierId);

  const calculateOD = (supId) => {
    const supExpenses = expenses.filter(exp => exp.supplierId === supId);
    const totalBilled = supExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const supPayments = payments.filter(p => p.supplierId === supId && p.type === 'supplier_payment');
    const totalPaid = supPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    return totalBilled - totalPaid;
  };

  const currentOD = activeSupplier ? calculateOD(activeSupplier._id) : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    const supData = { name: newSuppName, phone: newSuppTel, address: newSuppAddress };
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/suppliers/${editingId}`, supData);
        setSuppliers(suppliers.map(s => s._id === editingId ? res.data : s));
      } else {
        const res = await axios.post(`${API_URL}/suppliers`, supData);
        setSuppliers([res.data, ...suppliers]);
      }
      setIsAddSupplierOpen(false);
      setEditingId(null);
      setNewSuppName(''); setNewSuppTel(''); setNewSuppAddress('');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`${API_URL}/suppliers/${id}`);
        setSuppliers(suppliers.filter(s => s._id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const handleEdit = (sup) => {
    setEditingId(sup._id);
    setNewSuppName(sup.name);
    setNewSuppTel(sup.phone || '');
    setNewSuppAddress(sup.address || '');
    setIsAddSupplierOpen(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const payment = { supplierId: selectedSupplierId, amount: parseFloat(paymentAmount), date: paymentDate, reference: paymentRef, type: 'supplier_payment' };
      await axios.post(`${API_URL}/payments`, payment);
      // Let's manually add the payment to the local state since we don't have setPayments
      // But we can just reload the page for now or wait for sync API
      window.location.reload(); 
    } catch (err) { console.error(err); }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      const expense = {
        date: invDate,
        amount: parseFloat(invAmount),
        reason: invRemark,
        supplierId: selectedSupplierId,
        category: 'Supplier Bill'
      };
      await axios.post(`${API_URL}/expenses`, expense);
      window.location.reload(); // Refresh to pull updated data
    } catch (err) { 
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Failed to save bill. Error: ${errorMsg}`);
    }
  };

  const supplierBills = expenses.filter(exp => exp.supplierId === selectedSupplierId && exp.date?.startsWith(selectedMonth));
  const supplierPaymentHistory = payments.filter(p => p.supplierId === selectedSupplierId && p.type === 'supplier_payment');

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-card p-5 border-l-4 border-l-blue-500 flex flex-col h-full max-h-[600px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Suppliers
            </h3>
            <button onClick={() => { setEditingId(null); setIsAddSupplierOpen(true); }} className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {suppliers.map(sup => (
              <div 
                key={sup._id}
                onClick={() => setSelectedSupplierId(sup._id)}
                className={`group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-all font-medium cursor-pointer ${
                  selectedSupplierId === sup._id 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div>
                  <div className="font-bold">{sup.name}</div>
                  <div className="text-xs text-slate-500 mt-1">OD: Rs. {calculateOD(sup._id).toLocaleString()}</div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(sup); }} className="p-1.5 hover:text-blue-400"><Edit className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(sup._id); }} className="p-1.5 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeSupplier ? (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-[600px] xl:min-h-0">
          
          {/* Top Profile Card */}
          <div className="glass-card p-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl font-black text-amber-500 border-2 border-amber-500/30">
                {activeSupplier.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{activeSupplier.name}</h2>
                <p className="text-slate-400 text-sm whitespace-pre-line">{activeSupplier.tel}</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">To Pay (OD)</p>
                <p className={`text-3xl font-black ${currentOD > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  Rs. {currentOD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsPaymentOpen(true)} className="glass-button !w-auto !py-3 !px-4 flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-500">
                  <Wallet className="w-5 h-5" /> Add Payment
                </button>
                <button onClick={() => setIsInvoiceOpen(true)} className="glass-button !w-auto !py-3 !px-4 flex items-center gap-2 !bg-amber-600 hover:!bg-amber-500 shadow-amber-500/30">
                  <FileText className="w-5 h-5" /> Add Bill
                </button>
              </div>
            </div>
          </div>

          {/* Month Filter & Data */}
          <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
            <div className="p-5 border-b border-slate-700/50 flex flex-wrap gap-4 items-center justify-between bg-slate-900/50">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-bold text-slate-400">View Data For:</span>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="glass-input !py-1.5 !w-auto text-sm [&>option]:bg-slate-900">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Bills List */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <FileText className="text-amber-400 w-5 h-5" /> Bills Received ({selectedMonth})
                </h3>
                <div className="space-y-3">
                  {supplierBills.map(inv => (
                    <div key={inv._id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{inv.date}</div>
                        <div className="text-xs text-slate-400">{inv.reason || 'No remark'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-400">+ Rs. {inv.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {supplierBills.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No bills recorded for this month.</p>}
                </div>
              </div>

              {/* Payments List */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <Wallet className="text-emerald-400 w-5 h-5" /> Payment History (All Time)
                </h3>
                <div className="space-y-3">
                  {supplierPaymentHistory.map(p => (
                    <div key={p._id} className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{p.date}</div>
                        <div className="text-xs text-slate-400">Ref: {p.reference || 'N/A'}</div>
                      </div>
                      <div className="font-bold text-emerald-400 text-lg">- Rs. {p.amount.toLocaleString()}</div>
                    </div>
                  ))}
                  {supplierPaymentHistory.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No payments recorded.</p>}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center glass-card">
          <p className="text-slate-400 text-lg">Select a supplier to view details.</p>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-md p-6 relative border-t-4 border-t-amber-500 shadow-2xl">
            <button onClick={() => setIsAddSupplierOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">New Supplier</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier Name *</label>
                <input type="text" required value={newSuppName} onChange={e => setNewSuppName(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Telephone</label>
                <input type="text" value={newSuppTel} onChange={e => setNewSuppTel(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                <textarea value={newSuppAddress} onChange={e => setNewSuppAddress(e.target.value)} className="glass-input h-20 resize-none"></textarea>
              </div>
              <button type="submit" className="glass-button w-full !py-3 font-bold mt-2 !bg-amber-600 hover:!bg-amber-500 shadow-amber-500/30">Save Supplier</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-sm p-6 relative border-t-4 border-t-amber-500 shadow-2xl">
            <button onClick={() => setIsInvoiceOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Record Supplier Bill</h2>
            
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (Rs.) *</label>
                <input type="number" required min="1" value={invAmount} onChange={e => setInvAmount(e.target.value)} className="glass-input font-bold text-red-400 text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date *</label>
                <input type="date" required value={invDate} onChange={e => setInvDate(e.target.value)} className="glass-input [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Remark / Bill No</label>
                <input type="text" value={invRemark} onChange={e => setInvRemark(e.target.value)} className="glass-input" />
              </div>
              <div className="pt-2 pb-2">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-600 rounded-xl hover:border-brand-500 transition-colors cursor-pointer bg-slate-900/50">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-bold text-slate-300">Attach Image/PDF (Optional)</span>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>
              <button type="submit" className="glass-button w-full !py-3 font-bold mt-2 !bg-amber-600 hover:!bg-amber-500 shadow-amber-500/30">Save Bill</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-sm p-6 relative border-t-4 border-t-emerald-500 shadow-2xl">
            <button onClick={() => setIsPaymentOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Make Payment</h2>
            
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (Rs.) *</label>
                <input type="number" required min="1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="glass-input font-bold text-emerald-400 text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date *</label>
                <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="glass-input [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Reference / Cheque No</label>
                <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} className="glass-input" />
              </div>
              <button type="submit" className="glass-button w-full !py-3 font-bold mt-2 !bg-emerald-600 hover:!bg-emerald-500">Save Payment</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
