require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Middleware for Serverless
let isConnected = false;
app.use(async (req, res, next) => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    return res.status(500).json({ message: "Server misconfiguration" });
  }
  
  if (isConnected) {
    return next();
  }
  
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected inside middleware!');
    next();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
const authRoutes = require('../backend/routes/authRoutes');
const customerRoutes = require('../backend/routes/customerRoutes');
const supplierRoutes = require('../backend/routes/supplierRoutes');
const invoiceRoutes = require('../backend/routes/invoiceRoutes');
const expenseRoutes = require('../backend/routes/expenseRoutes');
const productionRoutes = require('../backend/routes/productionRoutes');
const paymentRoutes = require('../backend/routes/paymentRoutes');
const salaryRoutes = require('../backend/routes/salaryRoutes');
const gatePassRoutes = require('../backend/routes/gatePassRoutes');
const settingsRoutes = require('../backend/routes/settingsRoutes');
const syncRoutes = require('../backend/routes/syncRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/gatepasses', gatePassRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sync', syncRoutes);

// Basic Route
app.get('/api', (req, res) => {
  res.send('Jeans Factory API is running...');
});

// Conditionally listen if not running on Vercel Serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;
