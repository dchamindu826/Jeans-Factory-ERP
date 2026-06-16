import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import axios from 'axios';
import { Users, Plus, Trash2, Edit, X, ShieldAlert } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function StaffManagement() {
  const { staff, setStaff } = useGlobalContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [basicSalary, setBasicSalary] = useState('');
  const [salaryType, setSalaryType] = useState('standard');
  const [bankName, setBankName] = useState('');
  const [accNo, setAccNo] = useState('');
  const [branch, setBranch] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setPassword('');
    setRole('employee');
    setBasicSalary('');
    setSalaryType('standard');
    setBankName('');
    setAccNo('');
    setBranch('');
    setBeneficiaryName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user._id);
    setName(user.name);
    setPhone(user.phone);
    setPassword(user.password);
    setRole(user.role);
    setBasicSalary(user.basicSalary || '');
    setSalaryType(user.salaryType || 'standard');
    setBankName(user.bankName || '');
    setAccNo(user.accNo || '');
    setBranch(user.branch || '');
    setBeneficiaryName(user.beneficiaryName || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const staffData = { 
      name, phone, password, role, 
      basicSalary: parseFloat(basicSalary) || 0, 
      salaryType, bankName, accNo, branch, beneficiaryName
    };

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/auth/staff/${editingId}`, staffData);
        setStaff(staff.map(s => s._id === editingId ? res.data : s));
      } else {
        const res = await axios.post(`${API_URL}/auth/staff`, staffData);
        setStaff([...staff, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save staff", err);
      alert("Failed to save staff. Please check if the phone number is already registered.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await axios.delete(`${API_URL}/auth/staff/${id}`);
        setStaff(staff.filter(s => s._id !== id));
      } catch (err) {
        console.error("Failed to delete staff", err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 shrink-0 border-l-4 border-l-brand-500">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-brand-400" /> Staff Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage employee accounts and system access roles.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="glass-button !w-auto !py-2.5 !px-5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-auto custom-scrollbar p-5">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700/50">
                <th className="pb-4 font-semibold px-4">Name / Phone</th>
                <th className="pb-4 font-semibold px-4">Role / Password</th>
                <th className="pb-4 font-semibold px-4 text-right">Basic Salary</th>
                <th className="pb-4 font-semibold px-4">Bank Details</th>
                <th className="pb-4 font-semibold text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {staff.map(user => (
                <tr key={user._id} className="text-slate-200 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-white text-lg">{user.name}</p>
                    <p className="text-brand-300 font-bold text-sm">{user.phone}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="mb-1">
                      {user.role === 'manager' ? (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 uppercase tracking-widest inline-flex items-center gap-1 w-max">
                          <ShieldAlert className="w-3 h-3" /> Manager
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold border border-slate-600 uppercase tracking-widest inline-flex w-max">
                          Employee
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 font-mono text-xs mt-1">Pwd: {user.password}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-black text-emerald-400 text-lg">Rs. {parseFloat(user.basicSalary || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold uppercase text-slate-500">{user.salaryType === 'fixed' ? 'Fixed Salary' : 'Standard + OT'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-bold text-slate-300">{user.bankName || 'N/A'} <span className="text-xs text-slate-500 font-normal">({user.branch})</span></p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{user.accNo || 'N/A'}</p>
                    <p className="text-xs text-brand-300 font-medium uppercase tracking-wider mt-1">{user.beneficiaryName || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500">No staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-8 relative border-t-4 border-t-brand-500 my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 p-2"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Staff Details' : 'Register New Staff'}</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-brand-400 font-bold uppercase tracking-widest text-xs border-b border-slate-700 pb-2 mb-4">Login Details</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number (Login ID)</label>
                  <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="glass-input text-brand-300 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <input type="text" required value={password} onChange={e => setPassword(e.target.value)} className="glass-input font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">System Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="glass-input [&>option]:bg-slate-900 font-bold">
                    <option value="employee">Employee (Production Only)</option>
                    <option value="manager">Manager (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Salary Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-slate-700 pb-2 mb-4">Salary Information</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Basic Salary (Rs.)</label>
                  <input type="number" required min="0" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} className="glass-input font-bold text-emerald-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Salary Type</label>
                  <select value={salaryType} onChange={e => setSalaryType(e.target.value)} className="glass-input [&>option]:bg-slate-900">
                    <option value="standard">Standard (Basic + OT + Incentives)</option>
                    <option value="fixed">Fixed (No OT/Incentives)</option>
                  </select>
                </div>
              </div>

              {/* Banking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-slate-700 pb-2 mb-4">Bank Details</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Beneficiary Name</label>
                  <input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} className="glass-input text-brand-300" placeholder="Name on account" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="glass-input" placeholder="e.g., BOC" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Account Number</label>
                  <input type="text" value={accNo} onChange={e => setAccNo(e.target.value)} className="glass-input font-mono" placeholder="1234567890" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch</label>
                  <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="glass-input" placeholder="Ja-Ela" />
                </div>
              </div>

              <button type="submit" className="glass-button w-full !py-4 text-lg font-bold mt-8 shadow-brand-500/30">Save Staff Member</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
