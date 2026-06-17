import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import axios from 'axios';
import { Calendar, Save, Calculator, Clock } from 'lucide-react';

export default function Salary() {
  const { staff, API_URL, savedSalaries, fetchAllData, settings } = useGlobalContext();
  const months = settings?.availableMonths || ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '2026-06');

  // This will hold the working data for the table
  const [payrolls, setPayrolls] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  // When month changes, load saved data OR generate a fresh template from active staff
  useEffect(() => {
    const existingData = savedSalaries.find(s => s.month === selectedMonth);
    
    if (existingData) {
      setPayrolls(existingData.payrolls);
    } else {
      // Generate blank template
      const template = staff.map(emp => ({
        empId: emp._id,
        name: emp.name,
        basicSalary: emp.basicSalary || 0,
        salaryType: emp.salaryType || 'standard',
        otHours: 0,
        allowance: 0,
        incentive: 0,
        advance: 0,
        nonPaidDays: 0
      }));
      setPayrolls(template);
    }
  }, [selectedMonth, staff, savedSalaries]);

  // Handle Input Changes
  const handleInputChange = (empId, field, value) => {
    const numValue = parseFloat(value) || 0;
    setPayrolls(payrolls.map(p => p.empId === empId ? { ...p, [field]: numValue } : p));
  };

  // Calculation Logic per Employee
  const calculateRow = (row) => {
    const basic = row.basicSalary || 0;
    const advance = row.advance || 0;
    
    if (row.salaryType === 'fixed') {
      return {
        basic,
        perDayRate: 0,
        otRate: 0,
        otAmount: 0,
        allowance: 0,
        incentive: 0,
        advance,
        nonPaidAmount: 0,
        netSalary: basic - advance
      };
    }

    const perDayRate = basic / 25;
    const otRate = (basic / 270) * 1.5;
    
    const otAmount = otRate * (row.otHours || 0);
    const nonPaidAmount = perDayRate * (row.nonPaidDays || 0);
    const allowance = row.allowance || 0;
    const incentive = row.incentive || 0;
    
    const netSalary = basic + otAmount + allowance + incentive - advance - nonPaidAmount;

    return {
      basic,
      perDayRate,
      otRate,
      otAmount,
      allowance,
      incentive,
      advance,
      nonPaidAmount,
      netSalary
    };
  };

  const handleSaveMonth = async () => {
    try {
      await axios.post(`${API_URL}/salary`, { month: selectedMonth, payrolls });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 3000);
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  // Calculate Totals
  const totals = payrolls.reduce((acc, row) => {
    const calc = calculateRow(row);
    acc.basic += calc.basic;
    acc.advance += calc.advance;
    acc.net += calc.netSalary;
    return acc;
  }, { basic: 0, advance: 0, net: 0 });

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 pb-8">
      
      {/* Top Bar - Month Selection & Save */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 border-l-4 border-l-brand-500 shrink-0 shadow-lg">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-brand-400 font-black uppercase tracking-widest bg-brand-500/10 px-4 py-2 rounded-xl">
            <Calendar className="w-5 h-5" />
            Payroll Month
          </div>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="glass-input !py-2 !px-4 !w-64 font-bold text-lg text-white appearance-none cursor-pointer [&>option]:bg-slate-900"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <button onClick={handleSaveMonth} className="glass-button !w-full md:!w-auto !py-3 !px-8 flex items-center justify-center gap-3 !bg-emerald-600 hover:!bg-emerald-500 shadow-emerald-500/30">
          <Save className="w-5 h-5" /> {saveStatus || 'Save Month Data'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Salary Calculation Section */}
        <div className="glass-card flex flex-col overflow-hidden relative border-t-4 border-t-blue-500">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40 shrink-0">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                <Calculator className="text-blue-400 w-7 h-7" /> Salary Calculation 
              </h3>
              <p className="text-slate-400 font-medium mt-1 text-sm tracking-wider uppercase">Payroll Month: <span className="text-brand-300 font-black">{selectedMonth}</span></p>
            </div>
            {savedSalaries.some(s => s.month === selectedMonth) && (
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-bold uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                <Save className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
          
          <div className="overflow-x-auto custom-scrollbar p-6">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-widest border-b-2 border-slate-700">
                  <th className="py-4 px-4 font-black">#</th>
                  <th className="py-4 px-4 font-black min-w-[200px]">Employee Name</th>
                  
                  {/* Base Rates */}
                  <th className="py-4 px-4 font-black text-right border-l-2 border-slate-700">Basic Salary</th>
                  <th className="py-4 px-4 font-bold text-right text-slate-400 text-[10px]">Per Day Rate</th>
                  <th className="py-4 px-4 font-bold text-right text-slate-400 text-[10px]">OT Rate / Hr</th>
                  
                  {/* Earnings */}
                  <th className="py-4 px-4 font-black text-center text-blue-400 border-l-2 border-slate-700 bg-blue-900/10">OT Hours</th>
                  <th className="py-4 px-4 font-black text-center text-emerald-400 bg-emerald-900/10">Allowance</th>
                  <th className="py-4 px-4 font-black text-center text-emerald-400 bg-emerald-900/10">Incentive</th>
                  
                  {/* Deductions */}
                  <th className="py-4 px-4 font-black text-center text-red-400 border-l-2 border-slate-700 bg-red-900/10">Advance</th>
                  <th className="py-4 px-4 font-black text-center text-red-400 bg-red-900/10">No Pay (Days)</th>
                  
                  {/* Net */}
                  <th className="py-4 px-6 font-black text-right border-l-2 border-slate-700 bg-slate-800">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {payrolls.map((row, index) => {
                  const calc = calculateRow(row);
                  const isFixed = row.salaryType === 'fixed';
                  
                  return (
                  <tr key={row.empId} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-5 px-4 font-black text-slate-500">{index + 1}</td>
                    <td className="py-5 px-4">
                      <p className="font-bold text-white text-base tracking-wide">{row.name}</p>
                      {isFixed && <span className="inline-block mt-1 text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 uppercase tracking-widest font-bold">Fixed Rate</span>}
                    </td>
                    
                    {/* Base Rates */}
                    <td className="py-5 px-4 text-right border-l border-slate-700/50">
                      <span className="font-black text-slate-200 text-base">Rs. {calc.basic.toLocaleString()}</span>
                    </td>
                    <td className="py-5 px-4 text-right text-xs text-slate-500 font-mono font-bold">{isFixed ? '-' : calc.perDayRate.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td className="py-5 px-4 text-right text-xs text-slate-500 font-mono font-bold">{isFixed ? '-' : calc.otRate.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    
                    {/* Earnings */}
                    <td className="py-3 px-4 border-l border-slate-700/50 bg-blue-900/5 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                          type="number" min="0" disabled={isFixed} placeholder="0"
                          value={row.otHours || ''} onChange={e => handleInputChange(row.empId, 'otHours', e.target.value)}
                          className="w-20 bg-slate-900/80 border-2 border-slate-700 text-white rounded-lg px-2 py-2 text-center text-sm font-bold focus:border-blue-500 focus:bg-slate-900 disabled:opacity-30 transition-all placeholder:text-slate-600"
                        />
                        {!isFixed && row.otHours > 0 && (
                          <span className="text-[11px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            + Rs. {calc.otAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-emerald-900/5 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                          type="number" min="0" disabled={isFixed} placeholder="0"
                          value={row.allowance || ''} onChange={e => handleInputChange(row.empId, 'allowance', e.target.value)}
                          className="w-24 bg-slate-900/80 border-2 border-slate-700 text-emerald-400 rounded-lg px-2 py-2 text-right text-sm font-bold focus:border-emerald-500 focus:bg-slate-900 disabled:opacity-30 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-emerald-900/5 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                          type="number" min="0" disabled={isFixed} placeholder="0"
                          value={row.incentive || ''} onChange={e => handleInputChange(row.empId, 'incentive', e.target.value)}
                          className="w-24 bg-slate-900/80 border-2 border-slate-700 text-emerald-400 rounded-lg px-2 py-2 text-right text-sm font-bold focus:border-emerald-500 focus:bg-slate-900 disabled:opacity-30 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-4 border-l border-slate-700/50 bg-red-900/5 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                          type="number" min="0" placeholder="0"
                          value={row.advance || ''} onChange={e => handleInputChange(row.empId, 'advance', e.target.value)}
                          className="w-24 bg-slate-900/80 border-2 border-slate-700 text-red-400 rounded-lg px-2 py-2 text-right text-sm font-bold focus:border-red-500 focus:bg-slate-900 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-red-900/5 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input 
                          type="number" min="0" disabled={isFixed} placeholder="0"
                          value={row.nonPaidDays || ''} onChange={e => handleInputChange(row.empId, 'nonPaidDays', e.target.value)}
                          className="w-20 bg-slate-900/80 border-2 border-slate-700 text-white rounded-lg px-2 py-2 text-center text-sm font-bold focus:border-red-500 focus:bg-slate-900 disabled:opacity-30 transition-all placeholder:text-slate-600"
                        />
                        {!isFixed && row.nonPaidDays > 0 && (
                          <span className="text-[11px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            - Rs. {calc.nonPaidAmount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Net Salary */}
                    <td className="py-5 px-6 text-right border-l-2 border-slate-700 bg-slate-800/60 group-hover:bg-slate-800 transition-colors">
                      <span className="font-black text-brand-300 text-xl tracking-wide">
                        Rs. {calc.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                )})}
                {payrolls.length === 0 && (
                  <tr><td colSpan="11" className="py-12 text-center text-slate-500 font-bold text-lg">No active staff members found.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 border-t-4 border-slate-700">
                <tr>
                  <td colSpan="2" className="py-6 px-4 text-right font-black text-slate-400 uppercase tracking-widest text-sm">Company Totals:</td>
                  <td className="py-6 px-4 text-right font-black text-white text-lg border-l border-slate-800">Rs. {totals.basic.toLocaleString()}</td>
                  <td colSpan="5"></td>
                  <td className="py-6 px-4 text-right font-black text-red-400 text-lg border-l border-slate-800">- Rs. {totals.advance.toLocaleString()}</td>
                  <td></td>
                  <td className="py-6 px-6 text-right border-l-4 border-slate-700 font-black text-emerald-400 text-3xl bg-slate-800 shadow-inner">
                    Rs. {totals.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>



      </div>
    </div>
  );
}
