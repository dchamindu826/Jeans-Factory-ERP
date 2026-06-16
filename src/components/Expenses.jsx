import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalContext';
import { 
  Calendar, 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  FileText, 
  Copy, 
  Filter
} from 'lucide-react';
import IssueNote from './IssueNote';

export default function Expenses() {
  const { expenses, setExpenses, suppliers, API_URL, settings, updateSettings } = useGlobalContext();
  
  const categories = settings?.expenseCategories || [];
  const months = settings?.availableMonths || [];

  // State
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isIssueNoteOpen, setIsIssueNoteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Category Management State
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Add Expense State
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expReason, setExpReason] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState(categories[0] || '');
  const [expSupplierId, setExpSupplierId] = useState('');

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const issueNoteRef = useRef(null);
  const [newMonth, setNewMonth] = useState('');

  const filteredExpenses = expenses.filter(exp => exp.date?.startsWith(selectedMonth));

  // Month Handlers
  const handleAddMonth = () => {
    if (newMonth.trim() && !months.includes(newMonth.trim())) {
      updateSettings({ ...settings, availableMonths: [...months, newMonth.trim()] });
      setNewMonth('');
    }
  };

  // Category Handlers
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      updateSettings({ ...settings, expenseCategories: [...categories, newCategory.trim()] });
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (cat) => {
    updateSettings({ ...settings, expenseCategories: categories.filter(c => c !== cat) });
  };

  const handleEditCategorySave = (oldCat) => {
    if (editCategoryName.trim() && !categories.includes(editCategoryName.trim())) {
      updateSettings({ 
        ...settings, 
        expenseCategories: categories.map(c => c === oldCat ? editCategoryName.trim() : c) 
      });
    }
    setEditingCategory(null);
  };

  // Expense Handlers
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    try {
      const expData = {
        date: expDate,
        reason: expReason,
        amount: parseFloat(expAmount),
        category: expCategory,
        supplierId: expSupplierId || null
      };

      if (editingExpenseId) {
        const res = await axios.put(`${API_URL}/expenses/${editingExpenseId}`, expData);
        setExpenses(expenses.map(ex => ex._id === editingExpenseId ? res.data : ex));
        setEditingExpenseId(null);
      } else {
        const res = await axios.post(`${API_URL}/expenses`, expData);
        setExpenses([res.data, ...expenses]);
      }
      setIsAddExpenseOpen(false);
      setExpReason(''); setExpAmount(''); setExpSupplierId('');
    } catch (err) { console.error(err); }
  };

  const handleEditExpenseClick = (expense) => {
    setEditingExpenseId(expense._id);
    setExpDate(expense.date);
    setExpReason(expense.reason);
    setExpAmount(expense.amount.toString());
    setExpCategory(expense.category);
    setExpSupplierId(expense.supplierId || '');
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if(window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_URL}/expenses/${id}`);
        setExpenses(expenses.filter(e => e._id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const handleCopyIssueNote = async () => {
    if (issueNoteRef.current) {
      try {
        const canvas = await html2canvas(issueNoteRef.current, { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Issue Note beautifully copied as an image! Paste it directly into WhatsApp.');
          } catch (err) {
            console.error('Failed to copy to clipboard', err);
          }
        });
      } catch (err) {
        console.error('Failed to generate image', err);
      }
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        <div className="glass-card p-5 border-l-4 border-l-brand-500 flex flex-col max-h-[350px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
            <Calendar className="w-5 h-5 text-brand-400" />
            Select Month
          </h3>
          <div className="flex gap-2 mb-4 shrink-0">
            <input 
              type="text" 
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              placeholder="E.g., 2026-07" 
              className="glass-input !py-2 !px-3 text-sm flex-1"
            />
            <button onClick={handleAddMonth} className="glass-button !w-auto !py-2 !px-3 !bg-brand-600/80 hover:!bg-brand-500">
              <Plus className="w-4 h-4" />
            </button>
          </div>
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

        <div className="glass-card p-5 flex-1 flex flex-col overflow-hidden border-l-4 border-l-purple-500">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
            <Filter className="w-5 h-5 text-purple-400" />
            Payment Categories
          </h3>
          <div className="flex gap-2 mb-4 shrink-0">
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category..." 
              className="glass-input !py-2 !px-3 text-sm flex-1"
            />
            <button onClick={handleAddCategory} className="glass-button !w-auto !py-2 !px-3 !bg-purple-600/80 hover:!bg-purple-500 !shadow-purple-500/30">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {categories.map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 group hover:bg-slate-800/50 transition-colors">
                {editingCategory === cat ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      autoFocus
                      type="text" 
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="glass-input !py-1 !px-2 text-sm flex-1"
                    />
                    <button onClick={() => handleEditCategorySave(cat)} className="text-emerald-400 hover:text-emerald-300 p-1"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-300 p-1"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-slate-300 text-sm font-medium">{cat}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingCategory(cat); setEditCategoryName(cat); }}
                        className="text-brand-400 hover:text-brand-300 p-1.5 hover:bg-brand-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat)} 
                        className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-[600px] xl:min-h-0">
        <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <button className="glass-button !w-auto !py-2 !px-4 flex items-center gap-2 !bg-emerald-600/80 hover:!bg-emerald-500">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button 
            onClick={() => { setEditingExpenseId(null); setIsAddExpenseOpen(true); }}
            className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2 text-md"
          >
            <Plus className="w-5 h-5" /> Create Expense
          </button>
        </div>

        <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
          <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40 shrink-0">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              Expenses <span className="px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-sm">{selectedMonth}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-5">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700/50">
                  <th className="pb-4 font-semibold px-2">Issue No</th>
                  <th className="pb-4 font-semibold px-2">Date</th>
                  <th className="pb-4 font-semibold px-4">Reason</th>
                  <th className="pb-4 font-semibold px-3 text-right">Category</th>
                  <th className="pb-4 font-semibold px-3 text-right">Amount</th>
                  <th className="pb-4 font-semibold text-center px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredExpenses.map(expense => (
                  <tr key={expense._id} className="text-slate-200 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-2 font-bold text-brand-300">{expense.issueNo}</td>
                    <td className="py-4 px-2 text-sm text-slate-300">{expense.date}</td>
                    <td className="py-4 px-4 text-slate-300">{expense.reason}</td>
                    <td className="py-4 px-3 text-right text-slate-300">{expense.category}</td>
                    <td className="py-4 px-3 text-right text-emerald-400 font-bold">
                      {expense.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedExpense(expense); setIsIssueNoteOpen(true); }} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><FileText className="w-4 h-4" /></button>
                        <button onClick={() => handleEditExpenseClick(expense)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteExpense(expense._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 relative border-t-4 border-t-brand-500">
            <button onClick={() => setIsAddExpenseOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">{editingExpenseId ? 'Edit Expense' : 'Create New Expense'}</h2>
            <form onSubmit={handleSaveExpense} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Category</label>
                <select required value={expCategory} onChange={e => setExpCategory(e.target.value)} className="glass-input text-white">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier</label>
                <select value={expSupplierId} onChange={e => setExpSupplierId(e.target.value)} className="glass-input text-white">
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason</label>
                <input type="text" required value={expReason} onChange={e => setExpReason(e.target.value)} className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                  <input type="number" required min="0" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="glass-input pl-12 font-bold" />
                </div>
              </div>
              <button type="submit" className="glass-button w-full !py-3 text-lg font-bold mt-4 shadow-brand-500/30">Save Expense</button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Note Modal */}
      {isIssueNoteOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="relative flex flex-col items-center gap-8">
            <button 
              onClick={() => setIsIssueNoteOpen(false)}
              className="absolute -top-14 right-0 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all border border-white/10 hover:border-red-400/50"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* The Actual Voucher inside a container */}
            <div className="overflow-hidden rounded-lg shadow-[0_0_50px_rgba(30,58,138,0.5)]">
              <IssueNote ref={issueNoteRef} expense={selectedExpense} />
            </div>

            {/* Actions */}
            <button 
              onClick={handleCopyIssueNote}
              className="glass-button !w-auto !py-4 !px-8 flex items-center gap-3 !bg-blue-600 hover:!bg-blue-500 !shadow-blue-500/50 text-lg font-bold tracking-wide rounded-2xl hover:-translate-y-1"
            >
              <Copy className="w-6 h-6" /> Copy Image for WhatsApp
            </button>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Clicking the button above will take a high-quality snapshot of the Issue Note and save it to your clipboard. You can then paste it directly into WhatsApp!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
