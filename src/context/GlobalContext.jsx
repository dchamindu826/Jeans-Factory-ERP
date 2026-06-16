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
  const [currentUser, setCurrentUser] = useState(null);
  const [savedSalaries, setSavedSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [productionLogs, setProductionLogs] = useState([]);
  const [payments, setPayments] = useState([]);

  // Fetch all initial data
  const fetchAllData = async () => {
    if (!currentUser) return; // Only fetch if logged in

    try {
      const [
        custRes, suppRes, invRes, passRes, staffRes,
        salRes, expRes, prodRes, payRes
      ] = await Promise.all([
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/suppliers`),
        axios.get(`${API_URL}/invoices`),
        axios.get(`${API_URL}/gatepasses`),
        axios.get(`${API_URL}/auth/staff`),
        axios.get(`${API_URL}/salary`),
        axios.get(`${API_URL}/expenses`),
        axios.get(`${API_URL}/production`),
        axios.get(`${API_URL}/payments`)
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
    } catch (err) {
      console.error("Error fetching data from backend", err);
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
      fetchAllData,
      API_URL
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
