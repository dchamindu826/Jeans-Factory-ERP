import React, { forwardRef } from 'react';

const IssueNote = forwardRef(({ expense }, ref) => {
  if (!expense) return null;

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-8 w-[800px] h-[500px] flex flex-col justify-between border-2 border-slate-200"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-900 mb-1">JEANS FACTORY (PVT) LTD.</h1>
          <p className="text-sm font-semibold">NO.45, Ganemulla Road, Ma-Eliya, Ja-Ela.</p>
          <p className="text-sm font-bold text-red-600 mt-1">VAT NO : 175486194 - 2525</p>
          <p className="text-sm font-bold mt-1">Tel - +94 076 336 5701</p>
          <p className="text-sm font-bold text-blue-800 mt-1">E-mail - jeansfactorypvtltd@gmail.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-300 uppercase mb-2">Issue Note</h2>
          <div className="p-2 rounded border" style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', minWidth: '120px', display: 'inline-block', textAlign: 'center' }}>
            <p className="text-xl font-bold" style={{ color: '#1e293b', margin: 0 }}>{expense.issueNo}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 py-6 space-y-6">
        <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-2">
          <span className="text-slate-500 font-bold uppercase text-sm w-32">Date</span>
          <span className="text-lg font-bold flex-1 text-slate-800">{expense.date}</span>
        </div>
        <div className="flex justify-between items-center border-b border-dashed border-slate-300 pb-2">
          <span className="text-slate-500 font-bold uppercase text-sm w-32">Category</span>
          <span className="text-lg font-bold flex-1 text-slate-800">{expense.category}</span>
        </div>
        <div className="flex justify-between items-start border-b border-dashed border-slate-300 pb-2">
          <span className="text-slate-500 font-bold uppercase text-sm w-32">Reason</span>
          <span className="text-lg font-semibold flex-1 text-slate-700">{expense.reason}</span>
        </div>
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2 mt-8">
          <span className="text-slate-600 font-black uppercase text-lg w-32">Amount (LKR)</span>
          <span className="text-4xl font-black text-blue-900 flex-1">
            {parseFloat(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-8 pb-4">
        <div className="text-center">
          <div className="border-t-2 border-slate-400 w-48 pt-2">
            <p className="font-bold text-slate-800 tracking-wide">Created by: Dilshana</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-slate-400 w-48 pt-2">
            <p className="font-bold text-slate-800 tracking-wide">Approved by</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default IssueNote;
