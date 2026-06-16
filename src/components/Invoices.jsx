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

              <div className="flex justify-end pt-4 border-t border-slate-700/50">
                <button type="submit" className="glass-button !w-auto !py-3 !px-8 text-lg font-bold tracking-widest shadow-brand-500/40">
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="relative flex flex-col items-center gap-6 max-h-screen">
            <button onClick={() => setPreviewInvoice(null)} className="absolute -top-12 right-0 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all border border-white/10 z-10"><X className="w-5 h-5" /></button>
            
            <div className="flex gap-4 mb-2">
              <button onClick={exportToPDF} className="glass-button !w-auto !py-2 !px-6 flex items-center gap-2 !bg-rose-600 hover:!bg-rose-500 font-bold tracking-wide rounded-xl">
                <Download className="w-4 h-4" /> Export PDF
              </button>
              <button onClick={() => exportToExcel(previewInvoice)} className="glass-button !w-auto !py-2 !px-6 flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-500 font-bold tracking-wide rounded-xl">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>

            {/* Printable Area - styled to exactly match Excel image */}
            <div className="bg-white text-black p-8 w-[210mm] min-h-[297mm] shadow-2xl relative overflow-y-auto custom-scrollbar" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div ref={printRef} className="bg-white p-4 w-full h-full border border-gray-300" style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                {/* Header Table */}
                <table className="w-full border-collapse border border-black mb-0 text-sm">
                  <tbody>
                    <tr>
                      <td colSpan="3" className="border border-black p-1">
                        <h1 className="text-xl font-bold text-[#002060] m-0">JEANS FACTORY (PVT) LTD.</h1>
                        <p className="font-bold m-0 leading-tight">NO.45, Ganemulla Road, Ma-Eliya,</p>
                        <p className="font-bold m-0 leading-tight">Ja-Ela.</p>
                        <p className="font-bold text-red-600 m-0 leading-tight">VAT NO : 175486194 - 2525</p>
                        <p className="font-bold italic m-0 leading-tight mt-1">Tel - +94 076 336 5701</p>
                        <p className="font-bold italic m-0 leading-tight mt-1">E-mail - jeansfactorypvtltd@gmail.com</p>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="border border-black p-1 text-center">
                        <h2 className="text-lg font-bold m-0 tracking-wide underline underline-offset-4">TAX INVOICE</h2>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1 w-1/2 align-top">
                        <p className="font-bold m-0">CONSIGNEE :</p>
                        <p className="font-bold m-0 mt-1">{customers.find(c => c.id === previewInvoice.customerId)?.name}</p>
                        <div className="font-bold m-0 leading-tight" style={{ whiteSpace: 'pre-wrap' }}>{customers.find(c => c.id === previewInvoice.customerId)?.address}</div>
                        <p className="font-bold text-red-600 m-0 mt-2">{customers.find(c => c.id === previewInvoice.customerId)?.vatNo}</p>
                        <div className="font-bold m-0 leading-tight" style={{ whiteSpace: 'pre-wrap' }}>{customers.find(c => c.id === previewInvoice.customerId)?.tel}</div>
                      </td>
                      <td className="border border-black p-0 w-1/4 align-top">
                        <div className="border-b border-black font-bold p-1 bg-gray-50 h-8">INVOICE NO.</div>
                        <div className="p-1 h-8">{previewInvoice.invoiceNo}</div>
                      </td>
                      <td className="border border-black p-0 w-1/4 align-top">
                        <div className="flex border-b border-black h-8">
                          <div className="w-1/2 border-r border-black font-bold p-1 bg-gray-50">INVOICE DATE:</div>
                          <div className="w-1/2 font-bold p-1 bg-gray-50 text-[11px] leading-tight flex items-center">JF G.PASS NO:</div>
                        </div>
                        <div className="flex h-8">
                          <div className="w-1/2 border-r border-black p-1">{previewInvoice.date.split('-').reverse().join('/')}</div>
                          <div className="w-1/2 p-1 font-bold text-red-600">{previewInvoice.gatePassNo}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Items Table */}
                <table className="w-full border-collapse border border-black border-t-0 text-sm">
                  <thead>
                    <tr>
                      <th colSpan="3" className="border border-black p-1 font-bold text-center bg-gray-50">FULL DESCRIPTION OF GOODS</th>
                      <th className="border border-black p-1 font-bold text-center w-16 bg-gray-50 text-[11px] leading-tight">QUANTI<br/>TY<br/>(PCS)</th>
                      <th className="border border-black p-1 font-bold text-center w-24 bg-gray-50">UNIT PRICE<br/>(RS.)</th>
                      <th className="border border-black p-1 font-bold text-center w-28 bg-gray-50">TOTAL VALUE<br/>(RS.)</th>
                    </tr>
                    <tr>
                      <th className="border border-black border-t-0 p-1 font-bold text-left w-32 align-top">STYLE #</th>
                      <th className="border border-black border-t-0 p-1 font-bold text-left w-32 align-top">Dry Process</th>
                      <th className="border border-black border-t-0 p-1 font-bold text-left w-32 align-top uppercase">WASH TYPE</th>
                      <th className="border border-black border-t-0 border-b-0 p-1"></th>
                      <th className="border border-black border-t-0 border-b-0 p-1"></th>
                      <th className="border border-black border-t-0 border-b-0 p-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Minimum 10 empty rows to fill space matching the image */}
                    {[...Array(Math.max(10, previewInvoice.items.length))].map((_, i) => {
                      const item = previewInvoice.items[i];
                      return (
                        <tr key={i} className="h-6">
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-[13px]">
                            {item ? <><div className="font-semibold">{item.styleNo}</div><div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div></> : ''}
                          </td>
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-[13px]" style={{ whiteSpace: 'pre-wrap' }}>
                            {item ? item.dryProcess : ''}
                          </td>
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-[13px]" style={{ whiteSpace: 'pre-wrap' }}>
                            {item ? item.washType : ''}
                          </td>
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-center font-bold text-[13px]">
                            {item && item.qty > 0 ? item.qty : ''}
                          </td>
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-left text-[13px]">
                            {item && item.unitPrice > 0 ? item.unitPrice : ''}
                          </td>
                          <td className="border-l border-r border-black px-1 align-top pt-1 text-right text-[13px]">
                            {item && item.total > 0 ? item.total.toFixed(2) : ''}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Gate Pass No Line */}
                    <tr className="h-6">
                      <td className="border-l border-r border-black px-1 pt-4 text-red-600 font-bold text-[13px]" colSpan="3">
                        {previewInvoice.gatePassNo ? `Laavanya Gate Pass No: ${previewInvoice.gatePassNo}` : ''}
                      </td>
                      <td className="border-l border-r border-black p-1"></td>
                      <td className="border-l border-r border-black p-1"></td>
                      <td className="border-l border-r border-black p-1"></td>
                    </tr>
                    {/* Padding rows */}
                    {[...Array(6)].map((_, i) => (
                      <tr key={`pad-${i}`} className="h-6">
                        <td className="border-l border-r border-black p-1"></td>
                        <td className="border-l border-r border-black p-1"></td>
                        <td className="border-l border-r border-black p-1"></td>
                        <td className="border-l border-r border-black p-1"></td>
                        <td className="border-l border-r border-black p-1"></td>
                        <td className="border-l border-r border-black p-1"></td>
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr>
                      <td colSpan="3" className="border-l border-t border-black p-1 text-right font-bold text-[13px]">Total Amount:</td>
                      <td className="border border-black p-1 text-center font-bold text-[13px]">
                        {previewInvoice.items.reduce((s, i) => s + (i.qty || 0), 0)}
                      </td>
                      <td className="border border-black p-1 text-left font-bold text-[13px]">
                        {previewInvoice.items.reduce((s, i) => s + (i.unitPrice || 0), 0)}
                      </td>
                      <td className="border border-black p-1 text-right font-bold text-[13px]">{previewInvoice.totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="border-l border-black p-1 text-right font-bold text-[13px]">(+) 18% VAT</td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 text-right font-bold text-[13px]">{previewInvoice.vat.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="border-l border-b border-black p-1 text-right font-bold text-[13px]">Full Amount With VAT :</td>
                      <td className="border border-black p-1 border-b-2 border-black"></td>
                      <td className="border border-black p-1 border-b-2 border-black"></td>
                      <td className="border border-black p-1 text-right font-bold text-[13px] border-b-2 border-black">{previewInvoice.fullAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="border-t-0 p-1"></td>
                      <td colSpan="3" className="border-l border-r border-b border-black p-1 pl-2 align-top h-20">
                        <p className="font-bold text-[12px] m-0 leading-tight">FOR AND ON BEHALF OF</p>
                        <p className="font-bold text-[12px] m-0 leading-tight">JEANS FACTORY</p>
                      </td>
                    </tr>
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
