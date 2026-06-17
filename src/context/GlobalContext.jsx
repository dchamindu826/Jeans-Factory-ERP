import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);
  const [savedSalaries, setSavedSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [productionLogs, setProductionLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ expenseCategories: [], availableMonths: [] });

  // Fetch all initial data
  const fetchAllData = async () => {
    if (!currentUser) return; // Only fetch if logged in

    try {
      const res = await axios.get(`${API_URL}/sync`);
      const data = res.data;
      
      setCustomers(data.customers || []);
      setSuppliers(data.suppliers || []);
      setInvoices(data.invoices || []);
      setGatePasses(data.gatepasses || []);
      setStaff(data.staff || []);
      setSavedSalaries(data.salaries || []);
      setExpenses(data.expenses || []);
      setProductionLogs(data.productions || []);
      setPayments(data.payments || []);
      setSettings(data.settings || { expenseCategories: [], availableMonths: [] });
    } catch (err) {
      console.error("Error fetching data from backend", err);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const res = await axios.put(`${API_URL}/settings`, newSettings);
      setSettings(res.data);
    } catch (err) {
      console.error("Error updating settings", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  return (
    <GlobalContext.Provider value={{
      customers, setCustomers,
      suppliers, setSuppliers,
      invoices, setInvoices,
      gatePasses, setGatePasses,
      staff, setStaff,
      currentUser, setCurrentUser,
      expenses, setExpenses,
      savedSalaries, setSavedSalaries,
      productionLogs, setProductionLogs,
      payments, setPayments,
      settings, updateSettings,
      fetchAllData,
      API_URL
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
