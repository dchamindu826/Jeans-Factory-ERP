import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalContext';
import { 
  Calendar, Plus, Trash2, X, FileText, Save, Filter, Download, FileDown,
  Printer, ArrowLeft, PlusCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Invoices() {
  const { API_URL, settings } = useGlobalContext();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');
  
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  // View States: 'list' | 'create' | 'view'
  const [viewState, setViewState] = useState('list');
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const [newInvoiceData, setNewInvoiceData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    items: [
      { styleNo: '', description: '', unitPrice: 0, quantity: 1, total: 0 }
    ]
  });

  const printRef = useRef();

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

  const handleAddItem = () => {
    setNewInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { styleNo: '', description: '', unitPrice: 0, quantity: 1, total: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setNewInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...newInvoiceData.items];
    newItems[index][field] = value;
    
    if (field === 'unitPrice' || field === 'quantity') {
      newItems[index].total = (parseFloat(newItems[index].unitPrice) || 0) * (parseFloat(newItems[index].quantity) || 0);
    }
    
    setNewInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = (items) => {
    const qty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const amount = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    return { qty, amount };
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoiceData.customerId) {
      alert("Please select a customer.");
      return;
    }
    
    const { qty, amount } = calculateTotals(newInvoiceData.items);
    
    if (qty === 0 || amount === 0) {
      alert("Invoice must have at least one valid item with total > 0.");
      return;
    }

    try {
      const payload = {
        ...newInvoiceData,
        qty,
        amount
      };
      await axios.post(`${API_URL}/invoices`, payload);
      setViewState('list');
      setNewInvoiceData({ customerId: '', date: new Date().toISOString().split('T')[0], items: [{ styleNo: '', description: '', unitPrice: 0, quantity: 1, total: 0 }] });
      fetchData();
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this invoice?')) {
      try {
        await axios.delete(`${API_URL}/invoices/${id}`);
        if(currentInvoice?._id === id) setViewState('list');
        fetchData();
      } catch (err) {
        console.error("Error deleting invoice:", err);
      }
    }
  };

  const exportPDF = async () => {
    const element = printRef.current;
    
    // Add temporary styling to fix layout for pdf
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';
    
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    
    element.style.backgroundColor = originalBg;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${currentInvoice?.date}_${currentInvoice?._id?.substring(0,6)}.pdf`);
  };

  const exportExcel = () => {
    if(!currentInvoice) return;
    const customer = customers.find(c => c._id === currentInvoice.customerId || c._id === currentInvoice.customerId?._id);
    
    const wsData = [
      ['JEANS FACTORY (PVT) LTD'],
      ['TAX INVOICE'],
      [],
      ['Date:', currentInvoice.date, '', 'Invoice ID:', currentInvoice._id],
      ['Customer:', customer?.name, '', 'Contact:', customer?.phone],
      [],
      ['Style No', 'Description', 'Quantity', 'Unit Price (Rs)', 'Total (Rs)'],
      ...currentInvoice.items.map(item => [
        item.styleNo, item.description, item.quantity, item.unitPrice, item.total
      ]),
      [],
      ['', '', '', 'Total Quantity:', currentInvoice.qty],
      ['', '', '', 'Gross Amount:', `Rs. ${currentInvoice.amount}`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `Invoice_${currentInvoice.date}.xlsx`);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Filter by selected month unless date filter overrides
      if (!dateFilterStart && !dateFilterEnd && !inv.date.startsWith(selectedMonth)) return false;
      if (dateFilterStart && new Date(inv.date) < new Date(dateFilterStart)) return false;
      if (dateFilterEnd && new Date(inv.date) > new Date(dateFilterEnd)) return false;
      return true;
    });
  }, [invoices, dateFilterStart, dateFilterEnd, selectedMonth]);

  // View: Create Invoice
  if (viewState === 'create') {
    const totals = calculateTotals(newInvoiceData.items);
    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pb-10">
        <div className="glass-card p-6 border-t-4 border-t-brand-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <button onClick={() => setViewState('list')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              Create New Invoice
            </h2>
            <button onClick={handleSaveInvoice} className="glass-button !w-auto !py-2.5 !px-6 flex items-center gap-2 !bg-emerald-600/80 hover:!bg-emerald-500">
              <Save className="w-5 h-5" /> Save Invoice
            </button>
          </div>

          <form onSubmit={handleSaveInvoice}>
            {/* Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer</label>
                <select 
                  value={newInvoiceData.customerId} 
                  onChange={e => setNewInvoiceData({...newInvoiceData, customerId: e.target.value})}
                  className="glass-input w-full [&>option]:bg-slate-900 text-lg py-3"
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Invoice Date</label>
                <input 
                  type="date" 
                  value={newInvoiceData.date} 
                  onChange={e => setNewInvoiceData({...newInvoiceData, date: e.target.value})}
                  className="glass-input w-full text-lg py-3 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                  required
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Invoice Items</h3>
                <button type="button" onClick={handleAddItem} className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 bg-brand-500/10 px-4 py-2 rounded-lg transition-colors">
                  <PlusCircle className="w-5 h-5" /> Add Item
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 text-[10px] uppercase tracking-widest border-b border-slate-700">
                      <th className="p-3 font-bold w-[15%]">Style No</th>
                      <th className="p-3 font-bold w-[35%]">Description</th>
                      <th className="p-3 font-bold w-[15%]">Unit Price</th>
                      <th className="p-3 font-bold w-[15%]">Quantity</th>
                      <th className="p-3 font-bold w-[15%]">Total</th>
                      <th className="p-3 font-bold w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {newInvoiceData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2">
                          <input type="text" value={item.styleNo} onChange={e => handleItemChange(idx, 'styleNo', e.target.value)} className="glass-input w-full !py-2 !px-3" placeholder="ST-100" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="glass-input w-full !py-2 !px-3" placeholder="Washed Jeans" />
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="glass-input w-full !py-2 !px-3 text-right" placeholder="0.00" />
                        </td>
                        <td className="p-2">
                          <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="glass-input w-full !py-2 !px-3 text-right" placeholder="1" />
                        </td>
                        <td className="p-3 text-right font-black text-emerald-400">
                          Rs. {item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="p-2 text-center">
                          {newInvoiceData.items.length > 1 && (
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Quantity</span>
                  <span className="text-white font-black text-lg">{totals.qty} pcs</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Gross Total</span>
                  <span className="text-emerald-400 font-black text-2xl">Rs. {totals.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View: Print/Export Invoice
  if (viewState === 'view' && currentInvoice) {
    const customer = customers.find(c => c._id === currentInvoice.customerId || c._id === currentInvoice.customerId?._id);
    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pb-10">
        <div className="flex justify-between items-center shrink-0">
          <button onClick={() => setViewState('list')} className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back to Invoices
          </button>
          <div className="flex gap-3">
            <button onClick={exportExcel} className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2 !bg-emerald-600/80 hover:!bg-emerald-500 font-bold">
              <FileDown className="w-5 h-5" /> Export Excel
            </button>
            <button onClick={exportPDF} className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2 !bg-blue-600/80 hover:!bg-blue-500 font-bold">
              <Printer className="w-5 h-5" /> Download PDF
            </button>
          </div>
        </div>

        {/* Printable Area - Must be white bg with dark text for print */}
        <div className="bg-white p-10 md:p-16 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full text-slate-900 border border-slate-200" ref={printRef}>
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b-4 border-brand-500 pb-8">
            <div>
              <h1 className="text-4xl font-black text-brand-600 uppercase tracking-tighter mb-2">Jeans Factory</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Garment Wash & Dry Process</p>
              <div className="mt-4 text-sm text-slate-600">
                <p>123 Industrial Estate,</p>
                <p>Biyagama, Sri Lanka</p>
                <p>Tel: +94 11 234 5678</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest mb-4">Invoice</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block text-left min-w-[200px]">
                <div className="mb-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Invoice No</p>
                  <p className="font-bold text-slate-800">{currentInvoice._id?.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                  <p className="font-bold text-slate-800">{currentInvoice.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-10">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-3 border-b border-slate-200 pb-2">Bill To</h3>
            <h4 className="text-2xl font-black text-slate-800 mb-1">{customer?.name || 'Unknown Customer'}</h4>
            {customer?.address && <p className="text-slate-600 text-sm max-w-xs">{customer.address}</p>}
            {customer?.phone && <p className="text-slate-600 text-sm mt-1">{customer.phone}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y-2 border-slate-300">
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-black text-slate-600">Style No</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-black text-slate-600">Description</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-black text-slate-600 text-right">Qty</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-black text-slate-600 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-black text-brand-600 text-right">Total (Rs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInvoice.items && currentInvoice.items.length > 0 ? currentInvoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-slate-700">{item.styleNo || '-'}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{item.description || '-'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-700 text-right">{item.quantity}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 text-right">{(item.unitPrice || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-800 text-right">{(item.total || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-sm text-center text-slate-500 italic">No items detailed in this invoice.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between items-center py-2 px-4 border-b border-slate-100">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">Total Quantity</span>
                <span className="font-bold text-slate-700">{currentInvoice.qty} pcs</span>
              </div>
              <div className="flex justify-between items-center py-4 px-4 bg-slate-50 border-t-4 border-brand-500 rounded-b-xl mt-2">
                <span className="text-sm uppercase font-black text-slate-800 tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-brand-600">Rs. {Number(currentInvoice.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thank you for your business!</p>
            <p className="text-[10px] text-slate-400">Payment is due within 30 days. Please make cheques payable to Jeans Factory (PVT) LTD.</p>
          </div>
        </div>
      </div>
    );
  }

  // View: Main List
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
            onClick={() => setViewState('create')}
            className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Invoice
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col gap-4 pr-2">
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
                    <p className="text-emerald-400 font-black text-xl">Rs. {Number(invoice.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setCurrentInvoice(invoice); setViewState('view'); }} className="glass-button !w-auto !py-2 !px-4 !bg-blue-600/80 hover:!bg-blue-500 text-xs font-bold mr-2 opacity-0 group-hover:opacity-100 transition-all">
                      View / Export
                    </button>
                    <button onClick={() => handleDelete(invoice._id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredInvoices.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
               <FileText className="w-16 h-16 opacity-20 mb-4" />
               <p className="font-medium text-lg">No invoices found.</p>
               <p className="text-sm">Create a new invoice to get started.</p>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
