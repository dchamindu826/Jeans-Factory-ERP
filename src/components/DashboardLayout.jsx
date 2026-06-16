import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Factory, 
  Truck,
  FileText,
  Users,
  Clock,
  LogOut,
  PieChart,
  UserCog
} from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useGlobalContext();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const navigation = [
    { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Expenses', path: '/dashboard/expenses', icon: Receipt },
    { name: 'Production', path: '/dashboard/production', icon: Factory },
    { name: 'Gate Passes', path: '/dashboard/gate-pass', icon: Truck },
    { name: 'Invoices', path: '/dashboard/invoices', icon: FileText },
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Suppliers', path: '/dashboard/suppliers', icon: Truck },
    { name: 'Finance', path: '/dashboard/finance', icon: PieChart },
    { name: 'Salary & Attendance', path: '/dashboard/salary', icon: Clock },
    { name: 'Staff Management', path: '/dashboard/staff', icon: UserCog },
  ];

  const filteredNav = currentUser?.role === 'employee' 
    ? navigation.filter(item => item.name === 'Production')
    : navigation;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 overflow-hidden relative text-white">
      {/* Abstract Background Elements for Global Glass Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/30 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-full md:w-72 glass-sidebar relative z-10 flex flex-row md:flex-col h-auto md:h-full border-b md:border-r border-slate-700/50 shrink-0 overflow-x-auto md:overflow-x-hidden">
        <div className="p-4 md:p-6 border-r md:border-r-0 md:border-b border-slate-700/50 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center border border-brand-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Factory className="text-brand-400 w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Jeans Factory</h2>
            <p className="text-xs text-brand-300 uppercase tracking-wider font-semibold">Management System</p>
          </div>
        </div>

        <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-y-auto py-2 md:py-6 px-2 md:px-4 space-x-2 md:space-x-0 md:space-y-2 custom-scrollbar shrink-0">
          {filteredNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3.5 rounded-xl transition-all duration-300 font-medium whitespace-nowrap ${
                  isActive 
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              <span className="text-sm md:text-base hidden sm:inline-block md:inline-block">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 md:p-4 border-l md:border-l-0 md:border-t border-slate-700/50 flex items-center shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3.5 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 font-medium"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="hidden md:inline-block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
        <div className="max-w-[1600px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
