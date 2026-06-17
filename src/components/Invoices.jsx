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
    gatePassNo: '',
    vatPercentage: 18,
    items: [
      { styleNo: '', dryProcess: '', washType: '', unitPrice: 0, quantity: 1, total: 0 }
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
      items: [...prev.items, { styleNo: '', dryProcess: '', washType: '', unitPrice: 0, quantity: 1, total: 0 }]
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

  const calculateTotals = (items, vatPercentage) => {
    const qty = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const grossAmount = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const vatAmount = grossAmount * ((parseFloat(vatPercentage) || 0) / 100);
    const amount = grossAmount + vatAmount; // Full Amount With VAT
    return { qty, grossAmount, vatAmount, amount };
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoiceData.customerId) {
      alert("Please select a customer.");
      return;
    }
    
    const { qty, grossAmount, vatAmount, amount } = calculateTotals(newInvoiceData.items, newInvoiceData.vatPercentage);
    
    if (qty === 0 || amount === 0) {
      alert("Invoice must have at least one valid item with total > 0.");
      return;
    }

    try {
      const payload = {
        ...newInvoiceData,
        qty,
        grossAmount,
        vatAmount,
        amount
      };
      await axios.post(`${API_URL}/invoices`, payload);
      setViewState('list');
      setNewInvoiceData({ 
        customerId: '', 
        date: new Date().toISOString().split('T')[0], 
        gatePassNo: '',
        vatPercentage: 18,
        items: [{ styleNo: '', dryProcess: '', washType: '', unitPrice: 0, quantity: 1, total: 0 }] 
      });
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
    
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, logging: false });
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
      ['JEANS FACTORY (PVT) LTD.'],
      ['NO.45, Ganemulla Road, Ma-Eliya,'],
      ['Ja-Ela.'],
      ['VAT NO : 175486194 - 2525'],
      ['Tel - +94 076 336 5701'],
      ['E-mail - jeansfactorypvtltd@gmail.com'],
      [],
      ['', '', 'TAX INVOICE'],
      ['CONSIGNEE :', '', '', 'INVOICE', 'INVOICE DATE', 'JF G.PASS'],
      [customer?.name || '', '', '', currentInvoice._id?.substring(0, 8).toUpperCase(), currentInvoice.date, currentInvoice.gatePassNo],
      [customer?.address || ''],
      [`VAT NO : ${customer?.vatNo || ''}`],
      [`Tel : ${customer?.phone || ''}`],
      [],
      ['FULL DESCRIPTION OF GOODS', '', '', 'QUANTITY', 'UNIT PRICE', 'TOTAL VALUE'],
      ['STYLE # / DESCRIPTION', 'Dry Process', 'WASH TYPE', '(PCS)', '(RS.)', '(RS.)'],
      ...currentInvoice.items.map(item => [
        item.styleNo || item.description, item.dryProcess, item.washType, item.quantity, item.unitPrice, item.total
      ]),
      [],
      ['', '', 'Total Amount:', currentInvoice.qty, '', currentInvoice.grossAmount],
      ['', '', `(+) ${currentInvoice.vatPercentage}% VAT:`, '', '', currentInvoice.vatAmount],
      ['', '', 'Full Amount With VAT :', '', '', currentInvoice.amount],
      [],
      ['', '', '', 'FOR AND ON BEHALF OF'],
      ['', '', '', 'JEANS FACTORY']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-size columns slightly
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TAX INVOICE");
    XLSX.writeFile(wb, `TAX_INVOICE_${currentInvoice.date}.xlsx`);
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
    const totals = calculateTotals(newInvoiceData.items, newInvoiceData.vatPercentage);
    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pb-10">
        <div className="glass-card p-6 border-t-4 border-t-brand-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <button onClick={() => setViewState('list')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              Create New Tax Invoice
            </h2>
            <button onClick={handleSaveInvoice} className="glass-button !w-auto !py-2.5 !px-6 flex items-center gap-2 !bg-emerald-600/80 hover:!bg-emerald-500">
              <Save className="w-5 h-5" /> Save Invoice
            </button>
          </div>

          <form onSubmit={handleSaveInvoice}>
            {/* Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer (Consignee)</label>
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
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">JF G.Pass No</label>
                <input 
                  type="text" 
                  value={newInvoiceData.gatePassNo} 
                  onChange={e => setNewInvoiceData({...newInvoiceData, gatePassNo: e.target.value})}
                  className="glass-input w-full text-lg py-3" 
                  placeholder="e.g. 1141"
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Full Description of Goods</h3>
                <button type="button" onClick={handleAddItem} className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 bg-brand-500/10 px-4 py-2 rounded-lg transition-colors">
                  <PlusCircle className="w-5 h-5" /> Add Item Row
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 text-[10px] uppercase tracking-widest border-b border-slate-700">
                      <th className="p-3 font-bold w-[25%]">Style # / Desc</th>
                      <th className="p-3 font-bold w-[20%]">Dry Process</th>
                      <th className="p-3 font-bold w-[20%]">Wash Type</th>
                      <th className="p-3 font-bold w-[10%] text-right">Qty (Pcs)</th>
                      <th className="p-3 font-bold w-[10%] text-right">Unit Price</th>
                      <th className="p-3 font-bold w-[10%] text-right">Total</th>
                      <th className="p-3 font-bold w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {newInvoiceData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2">
                          <input type="text" value={item.styleNo} onChange={e => handleItemChange(idx, 'styleNo', e.target.value)} className="glass-input w-full !py-2 !px-3" placeholder="Style or Note" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={item.dryProcess} onChange={e => handleItemChange(idx, 'dryProcess', e.target.value)} className="glass-input w-full !py-2 !px-3" placeholder="Whisker etc." />
                        </td>
                        <td className="p-2">
                          <input type="text" value={item.washType} onChange={e => handleItemChange(idx, 'washType', e.target.value)} className="glass-input w-full !py-2 !px-3" placeholder="Dark Wash etc." />
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="glass-input w-full !py-2 !px-3 text-right" placeholder="1" />
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="glass-input w-full !py-2 !px-3 text-right" placeholder="0.00" />
                        </td>
                        <td className="p-3 text-right font-black text-emerald-400">
                          {item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-8">
              <div className="w-full max-w-md bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Amount (Gross)</span>
                  <span className="text-white font-black text-lg">Rs. {totals.grossAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">(+) VAT %</span>
                    <input 
                      type="number" 
                      className="glass-input !py-1 !px-2 w-20 text-center text-sm" 
                      value={newInvoiceData.vatPercentage}
                      onChange={e => setNewInvoiceData({...newInvoiceData, vatPercentage: e.target.value})}
                    />
                  </div>
                  <span className="text-red-400 font-bold text-md">Rs. {totals.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                  <span className="text-brand-400 font-black uppercase tracking-widest">Full Amount With VAT</span>
                  <span className="text-emerald-400 font-black text-3xl">Rs. {totals.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
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
    
    // Set up standard display values
    const vatPct = currentInvoice.vatPercentage ?? 18;
    const grossAmt = currentInvoice.grossAmount ?? currentInvoice.amount;
    const vatAmt = currentInvoice.vatAmount ?? 0;
    
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

        {/* Printable Area - Formatted exactly like the requested Excel template */}
        <div className="bg-white p-8 md:p-12 shadow-2xl max-w-[1000px] mx-auto w-full text-black font-sans relative" ref={printRef}>
          
          {/* Top Header - Company Info */}
          <div className="mb-4">
            <p className="font-bold text-[15px] leading-tight">JEANS FACTORY (PVT) LTD.</p>
            <p className="font-bold text-[13px] leading-tight">NO.45, Ganemulla Road, Ma-Eliya,</p>
            <p className="font-bold text-[13px] leading-tight">Ja-Ela.</p>
            <p className="font-bold text-[13px] leading-tight text-red-600 mt-1">VAT NO : 175486194 - 2525</p>
            <p className="font-bold text-[13px] italic leading-tight mt-1">Tel - +94 076 336 5701</p>
            <p className="font-bold text-[13px] italic leading-tight mt-3">E-mail - jeansfactorypvtltd@gmail.com</p>
          </div>

          <div className="text-center mb-2">
            <h1 className="text-[22px] font-black tracking-wide underline underline-offset-4 decoration-2">TAX INVOICE</h1>
          </div>

          {/* Consignee & Invoice Details Grid */}
          <div className="grid grid-cols-12 border-2 border-black">
            {/* Consignee */}
            <div className="col-span-8 border-r-2 border-black p-2">
              <p className="font-black text-[13px]">CONSIGNEE :</p>
              <p className="font-black text-[15px] mt-1">{customer?.name || 'UNKNOWN'}</p>
              <p className="font-bold text-[13px] leading-tight mt-1 whitespace-pre-line">{customer?.address || 'Address not provided'}</p>
              <p className="font-bold text-[13px] leading-tight text-red-600 mt-1">VAT NO : {customer?.vatNo || '-'}</p>
              <div className="font-bold text-[13px] leading-tight mt-1 flex gap-2">
                <span>Tel :</span>
                <div>
                  <p>{customer?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="col-span-4 flex">
              <div className="flex-1 border-r-2 border-black p-2">
                <p className="font-black text-[13px]">INVOICE</p>
                <p className="font-medium text-[13px] mt-2">{currentInvoice._id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex-1 border-r-2 border-black p-2">
                <p className="font-black text-[13px]">INVOICE</p>
                <p className="font-medium text-[13px] mt-2">{currentInvoice.date}</p>
              </div>
              <div className="flex-1 p-2">
                <p className="font-black text-[13px]">JF G.PASS</p>
                <p className="font-black text-red-600 text-[14px] mt-2">{currentInvoice.gatePassNo || '-'}</p>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="border-x-2 border-b-2 border-black mt-0">
            {/* Table Header */}
            <div className="flex border-b-2 border-black">
              <div className="flex-[6] flex flex-col">
                <div className="text-center font-black text-[14px] py-1 border-b border-black">
                  FULL DESCRIPTION OF GOODS
                </div>
                <div className="flex text-[12px] font-bold">
                  <div className="flex-[1] p-1 border-r border-black uppercase">STYLE #</div>
                  <div className="flex-[1] p-1 border-r border-black">Dry Process</div>
                  <div className="flex-[1] p-1 uppercase">WASH TYPE</div>
                </div>
              </div>
              <div className="flex-[1] border-l-2 border-black p-1 text-center flex items-center justify-center font-black text-[11px] leading-tight">
                QUANTITY<br/>(PCS)
              </div>
              <div className="flex-[1.5] border-l-2 border-black p-1 text-center flex items-center justify-center font-black text-[11px] leading-tight uppercase">
                UNIT PRICE<br/>(RS.)
              </div>
              <div className="flex-[1.5] border-l-2 border-black p-1 text-center flex items-center justify-center font-black text-[11px] leading-tight uppercase">
                TOTAL VALUE<br/>(RS.)
              </div>
            </div>

            {/* Table Body (Min Height for spacing) */}
            <div className="min-h-[250px] flex">
              <div className="flex-[6] flex flex-col">
                {currentInvoice.items && currentInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex text-[13px] border-b border-black/10 last:border-b-0 min-h-[30px]">
                    <div className="flex-[1] px-2 py-1 border-r border-black font-bold whitespace-pre-wrap">{item.styleNo}</div>
                    <div className="flex-[1] px-2 py-1 border-r border-black">{item.dryProcess}</div>
                    <div className="flex-[1] px-2 py-1">{item.washType}</div>
                  </div>
                ))}
              </div>
              <div className="flex-[1] border-l-2 border-black">
                {currentInvoice.items && currentInvoice.items.map((item, idx) => (
                  <div key={idx} className="text-center text-[13px] font-bold py-1 border-b border-black/10 last:border-b-0 min-h-[30px]">{item.quantity || ''}</div>
                ))}
              </div>
              <div className="flex-[1.5] border-l-2 border-black">
                {currentInvoice.items && currentInvoice.items.map((item, idx) => (
                  <div key={idx} className="text-[13px] font-bold py-1 px-2 border-b border-black/10 last:border-b-0 min-h-[30px] flex justify-between">
                    <span></span>
                    <span>{item.unitPrice ? item.unitPrice.toLocaleString() : ''}</span>
                  </div>
                ))}
              </div>
              <div className="flex-[1.5] border-l-2 border-black">
                {currentInvoice.items && currentInvoice.items.map((item, idx) => (
                  <div key={idx} className="text-[13px] font-black py-1 px-2 border-b border-black/10 last:border-b-0 min-h-[30px] flex justify-end">
                    <span>{item.total ? item.total.toLocaleString(undefined, {minimumFractionDigits: 2}) : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty space filler line to match Excel look */}
            <div className="flex border-t border-black/20 h-6">
              <div className="flex-[6]"></div>
              <div className="flex-[1] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black"></div>
            </div>

            {/* Totals Rows */}
            <div className="border-t-2 border-black flex">
              <div className="flex-[6] text-right font-black text-[14px] p-1 pr-4">Total Amount:</div>
              <div className="flex-[1] border-l-2 border-black text-center font-black text-[14px] p-1">{currentInvoice.qty}</div>
              <div className="flex-[1.5] border-l-2 border-black text-right font-black text-[14px] p-1 px-2">
                 {/* Unit price total is not usually summed, but user screenshot shows a value here, I'll leave it blank or calc if requested. Let's leave blank to be safe. */}
              </div>
              <div className="flex-[1.5] border-l-2 border-black text-right font-black text-[14px] p-1 px-2">
                {grossAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>

            <div className="border-t border-black flex">
              <div className="flex-[6] text-right font-black text-[14px] p-1 pr-4">(+) {vatPct}% VAT:</div>
              <div className="flex-[1] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black text-right font-black text-[14px] p-1 px-2">
                {vatAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>

            <div className="border-t-2 border-black flex bg-black/5">
              <div className="flex-[6] text-right font-black text-[15px] p-2 pr-4">Full Amount With VAT :</div>
              <div className="flex-[1] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black"></div>
              <div className="flex-[1.5] border-l-2 border-black text-right font-black text-[15px] p-2 px-2">
                {currentInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <div className="text-center min-w-[250px]">
              <div className="border-b border-black mb-2 pb-12"></div>
              <p className="font-black text-[12px] uppercase">FOR AND ON BEHALF OF</p>
              <p className="font-black text-[12px] uppercase mt-1">JEANS FACTORY</p>
            </div>
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
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-0.5">Total Amount</p>
                    <p className="text-emerald-400 font-black text-xl">Rs. {Number(invoice.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setCurrentInvoice(invoice); setViewState('view'); }} className="glass-button !w-auto !py-2 !px-4 !bg-blue-600/80 hover:!bg-blue-500 text-xs font-bold mr-2 opacity-0 group-hover:opacity-100 transition-all">
                      View / Print
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
