import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Factory } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import axios from 'axios';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser, API_URL } = useGlobalContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { phone, password });
      const user = res.data;
      setCurrentUser(user);
      
      if (user.role === 'employee') {
        navigate('/dashboard/production');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/bg.png)' }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 glass-card">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-brand-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-brand-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Factory className="w-8 h-8 text-brand-300" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Jeans Factory</h1>
          <p className="text-slate-300 mt-2 font-medium">Welcome back! Please login.</p>
        </div>

        {error && <div className="text-red-400 text-sm font-bold text-center bg-red-500/10 py-2 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input pl-11"
                placeholder="07X XXX XXXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="glass-button flex items-center justify-center gap-2 mt-8">
            Sign In <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
