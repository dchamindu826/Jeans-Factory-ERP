import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import Overview from './components/Overview';
import Expenses from './components/Expenses';
import Production from './components/Production';
import GatePass from './components/GatePass';
import Invoices from './components/Invoices';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import StaffManagement from './components/StaffManagement';
import Finance from './components/Finance';
import Salary from './components/Salary';
import Placeholder from './components/Placeholder';
import { GlobalProvider } from './context/GlobalContext';

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="production" element={<Production />} />
          <Route path="gate-pass" element={<GatePass />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="finance" element={<Finance />} />
          <Route path="salary" element={<Salary />} />
          <Route path="staff" element={<StaffManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
