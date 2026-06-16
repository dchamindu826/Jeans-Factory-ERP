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
      const [
        custRes, suppRes, invRes, passRes, staffRes,
        salRes, expRes, prodRes, payRes, settingsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/suppliers`),
        axios.get(`${API_URL}/invoices`),
        axios.get(`${API_URL}/gatepasses`),
        axios.get(`${API_URL}/auth/staff`),
        axios.get(`${API_URL}/salary`),
        axios.get(`${API_URL}/expenses`),
        axios.get(`${API_URL}/production`),
        axios.get(`${API_URL}/payments`),
        axios.get(`${API_URL}/settings`)
      ]);

      setCustomers(custRes.data);
      setSuppliers(suppRes.data);
      setInvoices(invRes.data);
      setGatePasses(passRes.data);
      setStaff(staffRes.data);
      setSavedSalaries(salRes.data);
      setExpenses(expRes.data);
      setProductionLogs(prodRes.data);
      setPayments(payRes.data);
      setSettings(settingsRes.data);
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
