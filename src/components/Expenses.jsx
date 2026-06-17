import React, { useState, useRef, useMemo } from 'react';
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
  Filter,
  Settings2
} from 'lucide-react';
import IssueNote from './IssueNote';

export default function Expenses() {
  const { expenses, setExpenses, API_URL, settings, updateSettings } = useGlobalContext();
  
  const categories = settings?.expenseCategories || [];
  const months = settings?.availableMonths || [];

  // State
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isIssueNoteOpen, setIsIssueNoteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const issueNoteRef = useRef(null);
  const [newMonth, setNewMonth] = useState('');

  // Filter out supplier bills and only show expenses for selected month
  const filteredExpenses = expenses.filter(exp => 
    exp.date?.startsWith(selectedMonth) && 
    exp.category !== 'Supplier Bill'
  );

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach(cat => totals[cat] = 0);
    filteredExpenses.forEach(exp => {
      if (totals[exp.category] !== undefined) {
        totals[exp.category] += (exp.amount || 0);
      }
    });
    return totals;
  }, [filteredExpenses, categories]);

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
        category: expCategory
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
      setExpReason(''); setExpAmount('');
    } catch (err) { 
      console.error(err); 
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Failed to save expense. Error: ${errorMsg}`);
    }
  };

  const handleEditExpenseClick = (expense) => {
    setEditingExpenseId(expense._id);
    setExpDate(expense.date);
    setExpReason(expense.reason);
    setExpAmount(expense.amount.toString());
    setExpCategory(expense.category);
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
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar xl:overflow-hidden pb-8 xl:pb-0">
      
      {/* Top Bar Controls */}
      <div className="glass-card p-5 shrink-0 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
        
        {/* Left Side: Month Selector & Export */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-400" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)} 
              className="glass-input !py-2 !w-40 text-white font-bold [&>option]:bg-slate-900"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <button className="glass-button !w-auto !py-2 !px-4 flex items-center gap-2 !bg-emerald-600/80 hover:!bg-emerald-500">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Right Side: Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`glass-button !w-auto !py-2.5 !px-4 flex items-center gap-2 transition-all ${isSettingsOpen ? '!bg-purple-600' : '!bg-slate-800'}`}
          >
            <Settings2 className="w-5 h-5" /> Manage Categories
          </button>
          
          <button 
            onClick={() => { setEditingExpenseId(null); setIsAddExpenseOpen(true); }}
            className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2 font-bold shadow-brand-500/30"
          >
            <Plus className="w-5 h-5" /> Create Expense
          </button>
        </div>
      </div>

      {/* Settings Dropdown Panel */}
      {isSettingsOpen && (
        <div className="glass-card p-6 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-t-purple-500 animate-in slide-in-from-top-2">
          {/* Month Settings */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Available Months</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                placeholder="E.g., 2026-07" 
                className="glass-input !py-2 text-sm flex-1"
              />
              <button onClick={handleAddMonth} className="glass-button !w-auto !py-2 !px-4 !bg-brand-600">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {months.map(month => (
                <span key={month} className="px-3 py-1 bg-slate-800/50 rounded-lg text-sm text-slate-300 border border-slate-700">{month}</span>
              ))}
            </div>
          </div>

          {/* Category Settings */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Expense Categories</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category..." 
                className="glass-input !py-2 text-sm flex-1"
              />
              <button onClick={handleAddCategory} className="glass-button !w-auto !py-2 !px-4 !bg-purple-600">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700 group">
                  {editingCategory === cat ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="bg-transparent border-b border-purple-500 text-white outline-none w-24 text-sm"
                      />
                      <button onClick={() => handleEditCategorySave(cat)} className="text-emerald-400"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditingCategory(null)} className="text-slate-400"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-slate-300">{cat}</span>
                      <button onClick={() => { setEditingCategory(cat); setEditCategoryName(cat); }} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"><Edit className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Width Table Area */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-auto custom-scrollbar p-2">
          <table className="w-full text-left border-collapse min-w-max whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300 text-xs uppercase tracking-widest sticky top-0 z-20 shadow-md">
                <th className="p-4 font-bold border-b border-slate-700/50">Issue No</th>
                <th className="p-4 font-bold border-b border-slate-700/50">Date</th>
                <th className="p-4 font-bold border-b border-slate-700/50">Reason</th>
                <th className="p-4 font-bold border-b border-slate-700/50 text-right bg-slate-800/40">Amount</th>
                {categories.map(cat => (
                  <th key={cat} className="p-4 font-bold border-b border-slate-700/50 text-right border-l border-slate-700/30">
                    {cat}
                  </th>
                ))}
                <th className="p-4 font-bold border-b border-slate-700/50 text-center sticky right-0 bg-slate-900/95 shadow-[-10px_0_15px_rgba(0,0,0,0.2)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredExpenses.map(expense => (
                <tr key={expense._id} className="text-slate-200 hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-bold text-brand-300">{expense.issueNo}</td>
                  <td className="p-4 text-sm text-slate-400">{expense.date}</td>
                  <td className="p-4">{expense.reason}</td>
                  <td className="p-4 text-right font-black text-emerald-400 bg-slate-800/20">
                    LKR {expense.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  
                  {/* Dynamic Category Columns */}
                  {categories.map(cat => (
                    <td key={cat} className="p-4 text-right border-l border-slate-700/30 text-slate-300 font-medium">
                      {expense.category === cat 
                        ? <span className="bg-slate-800 px-2 py-1 rounded">LKR {expense.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        : <span className="text-slate-700">-</span>
                      }
                    </td>
                  ))}
                  
                  <td className="p-2 text-center sticky right-0 bg-[#162032] group-hover:bg-[#1c283f] transition-colors shadow-[-10px_0_15px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setSelectedExpense(expense); setIsIssueNoteOpen(true); }} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"><FileText className="w-4 h-4" /></button>
                      <button onClick={() => handleEditExpenseClick(expense)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteExpense(expense._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State */}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={categories.length + 5} className="p-10 text-center text-slate-500">
                    No general expenses recorded for this month.
                  </td>
                </tr>
              )}
            </tbody>
            
            {/* Totals Footer Row */}
            {filteredExpenses.length > 0 && (
              <tfoot className="sticky bottom-0 z-20">
                <tr className="bg-brand-900/40 text-white font-black border-t-2 border-brand-500/50 backdrop-blur-md">
                  <td colSpan="3" className="p-4 text-right tracking-widest text-brand-300 uppercase">
                    Total Expenses
                  </td>
                  <td className="p-4 text-right text-emerald-400 bg-slate-900/60 shadow-inner">
                    LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  {categories.map(cat => (
                    <td key={cat} className="p-4 text-right border-l border-brand-500/20 text-brand-100">
                      LKR {categoryTotals[cat].toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                  <td className="p-4 sticky right-0 bg-[#0f1b31]"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-8 relative border-t-4 border-t-brand-500">
            <button onClick={() => setIsAddExpenseOpen(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">{editingExpenseId ? 'Edit Expense' : 'Create New Expense'}</h2>
            <form onSubmit={handleSaveExpense} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="glass-input [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Category</label>
                <select required value={expCategory} onChange={e => setExpCategory(e.target.value)} className="glass-input text-white [&>option]:bg-slate-900">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason / Description</label>
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
            
            <div className="overflow-hidden rounded-lg shadow-[0_0_50px_rgba(30,58,138,0.5)]">
              <IssueNote ref={issueNoteRef} expense={selectedExpense} />
            </div>

            <button 
              onClick={handleCopyIssueNote}
              className="glass-button !w-auto !py-4 !px-8 flex items-center gap-3 !bg-blue-600 hover:!bg-blue-500 !shadow-blue-500/50 text-lg font-bold tracking-wide rounded-2xl hover:-translate-y-1"
            >
              <Copy className="w-6 h-6" /> Copy Image for WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
