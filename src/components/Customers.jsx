import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import axios from 'axios';
import { Users, Plus, FileText, Wallet, X, Trash2, Edit } from 'lucide-react';

export default function Customers() {
  const { customers, setCustomers, invoices, gatePasses, payments, API_URL, settings } = useGlobalContext();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?._id || null);
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustTel, setNewCustTel] = useState('');
  const [newCustVat, setNewCustVat] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRef, setPaymentRef] = useState('');

  const activeCustomer = customers.find(c => c._id === selectedCustomerId);

  const calculateOD = (custId) => {
    const custInvoices = invoices.filter(inv => inv.customerId === custId);
    const totalInvoiced = custInvoices.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
    
    const custPayments = payments.filter(p => p.customerId === custId && p.type === 'customer_receipt');
    const totalPaid = custPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    return totalInvoiced - totalPaid;
  };

  const currentOD = activeCustomer ? calculateOD(activeCustomer._id) : 0;

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const customerData = { name: newCustName, tel: newCustTel, vatNo: newCustVat, address: newCustAddress };
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/customers/${editingId}`, customerData);
        setCustomers(customers.map(c => c._id === editingId ? res.data : c));
      } else {
        const res = await axios.post(`${API_URL}/customers`, customerData);
        setCustomers([res.data, ...customers]);
      }
      setIsAddCustomerOpen(false);
      setNewCustName(''); setNewCustTel(''); setNewCustVat(''); setNewCustAddress(''); setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (cust) => {
    setEditingId(cust._id);
    setNewCustName(cust.name); setNewCustTel(cust.tel || ''); setNewCustVat(cust.vatNo || ''); setNewCustAddress(cust.address || '');
    setIsAddCustomerOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`${API_URL}/customers/${id}`);
        setCustomers(customers.filter(c => c._id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const payment = { customerId: selectedCustomerId, amount: parseFloat(paymentAmount), date: paymentDate, reference: paymentRef, type: 'customer_receipt' };
      const res = await axios.post(`${API_URL}/payments`, payment);
      // Assuming context provider handles state update, if not update manually:
      // setPayments([...payments, res.data]);
      setIsPaymentOpen(false);
      setPaymentAmount(''); setPaymentRef('');
    } catch (err) { console.error(err); }
  };

  const customerInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId && inv.date?.startsWith(selectedMonth));
  const customerGatePasses = gatePasses.filter(gp => gp.customerId === selectedCustomerId && gp.date?.startsWith(selectedMonth));
  const customerPaymentHistory = payments.filter(p => p.customerId === selectedCustomerId && p.type === 'customer_receipt');

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-card p-5 border-l-4 border-l-brand-500 flex flex-col h-full max-h-[600px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" /> Customers
            </h3>
            <button onClick={() => { setEditingId(null); setIsAddCustomerOpen(true); }} className="p-2 bg-brand-500/20 text-brand-300 rounded-lg hover:bg-brand-500/30 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {customers.map(cust => (
              <div key={cust._id} className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all font-medium ${selectedCustomerId === cust._id ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                <button className="flex-1 text-left" onClick={() => setSelectedCustomerId(cust._id)}>
                  <div className="font-bold">{cust.name}</div>
                  <div className="text-xs text-slate-500 mt-1">OD: Rs. {calculateOD(cust._id).toLocaleString()}</div>
                </button>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cust)} className="p-1.5 hover:text-blue-400"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cust._id)} className="p-1.5 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCustomer ? (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-[600px] xl:min-h-0">
          <div className="glass-card p-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl font-black text-brand-500 border-2 border-brand-500/30">
                {activeCustomer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{activeCustomer.name}</h2>
                <p className="text-slate-400 text-sm whitespace-pre-line">{activeCustomer.tel}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Outstanding Debt</p>
                <p className={`text-3xl font-black ${currentOD > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Rs. {currentOD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <button onClick={() => setIsPaymentOpen(true)} className="glass-button !w-auto !py-3 !px-6 flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-500">
                <Wallet className="w-5 h-5" /> Add Payment
              </button>
            </div>
          </div>
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
              <div>
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <FileText className="text-brand-400 w-5 h-5" /> Invoices ({selectedMonth})
                </h3>
                <div className="space-y-3">
                  {customerInvoices.map(inv => (
                    <div key={inv._id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                      <div><div className="font-bold text-brand-300">{inv.invoiceNo}</div><div className="text-xs text-slate-400">{inv.date}</div></div>
                      <div className="text-right"><div className="font-bold text-emerald-400">Rs. {inv.totalAmount.toLocaleString()}</div></div>
                    </div>
                  ))}
                  {customerInvoices.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No invoices for this month.</p>}
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                    <FileText className="text-blue-400 w-5 h-5" /> Gate Passes ({selectedMonth})
                  </h3>
                  <div className="space-y-3">
                    {customerGatePasses.map(gp => (
                      <div key={gp.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <div className="font-bold text-blue-300">{gp.passNo}</div>
                        <div className="text-xs text-slate-400">{gp.date}</div>
                      </div>
                    ))}
                    {customerGatePasses.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No gate passes for this month.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700/50 pb-2 flex items-center gap-2">
                    <Wallet className="text-emerald-400 w-5 h-5" /> Payment History (All Time)
                  </h3>
                  <div className="space-y-3">
                    {customerPaymentHistory.map(p => (
                      <div key={p.id} className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{p.date}</div>
                          <div className="text-xs text-slate-400">Ref: {p.reference || 'N/A'}</div>
                        </div>
                        <div className="font-bold text-emerald-400 text-lg">- Rs. {p.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {customerPaymentHistory.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No payments recorded.</p>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center glass-card">
          <p className="text-slate-400 text-lg">Select a customer to view details.</p>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-md p-6 relative border-t-4 border-t-brand-500 shadow-2xl">
            <button onClick={() => setIsAddCustomerOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">New Customer</h2>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name *</label>
                <input type="text" required value={newCustName} onChange={e => setNewCustName(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Telephone</label>
                <input type="text" value={newCustTel} onChange={e => setNewCustTel(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">VAT No</label>
                <input type="text" value={newCustVat} onChange={e => setNewCustVat(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                <textarea value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)} className="glass-input h-20 resize-none"></textarea>
              </div>
              <button type="submit" className="glass-button w-full !py-3 font-bold mt-2">Save Customer</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-sm p-6 relative border-t-4 border-t-emerald-500 shadow-2xl">
            <button onClick={() => setIsPaymentOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Receive Payment</h2>
            
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
