require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Customer = require('./backend/models/Customer');
const Supplier = require('./backend/models/Supplier');
const Invoice = require('./backend/models/Invoice');
const GatePass = require('./backend/models/GatePass');
const User = require('./backend/models/User');
const Payroll = require('./backend/models/Payroll');
const Expense = require('./backend/models/Expense');
const Production = require('./backend/models/Production');
const Payment = require('./backend/models/Payment');
const Settings = require('./backend/models/Settings');

async function seedDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("Missing MONGO_URI");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data (except Admin user maybe? Or clear all and re-create Admin)
    console.log("Clearing old data...");
    await Promise.all([
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      Invoice.deleteMany({}),
      GatePass.deleteMany({}),
      User.deleteMany({}),
      Payroll.deleteMany({}),
      Expense.deleteMany({}),
      Production.deleteMany({}),
      Payment.deleteMany({}),
      Settings.deleteMany({})
    ]);

    // 1. Settings
    const settings = await Settings.create({
      type: 'system',
      expenseCategories: [
        'Salaries', 'Sub Contract', 'Petty Cash', 'Production', 
        'Maintains', 'Others', 'Transport', 'Fuel and Gas', 
        'Security Charges', 'Chemicals'
      ],
      availableMonths: ['2026-03', '2026-04', '2026-05', '2026-06'],
      dryProcessTypes: ['Whiskers', 'Scraping', 'Grinding', 'Tacking', 'Destroying'],
      washProcessTypes: ['Enzyme Wash', 'Bleach Wash', 'Stone Wash', 'Acid Wash', 'Tinting'],
      savedStyles: ['Skinny', 'Slim', 'Regular', 'Relaxed', 'Bootcut']
    });
    console.log("Created Settings...");

    // 2. Users (Admin + Staff)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123', salt);
    
    const admin = await User.create({
      name: 'Admin', phone: '0763365701', password: hashedPassword, role: 'manager',
      basicSalary: 100000, salaryType: 'fixed'
    });
    
    const staffMembers = await User.insertMany([
      { name: 'Nimal Perera', phone: '0711111111', password: hashedPassword, role: 'employee', basicSalary: 45000, salaryType: 'standard' },
      { name: 'Kamal Silva', phone: '0722222222', password: hashedPassword, role: 'employee', basicSalary: 40000, salaryType: 'standard' },
      { name: 'Sunil Shantha', phone: '0733333333', password: hashedPassword, role: 'employee', basicSalary: 42000, salaryType: 'standard' },
      { name: 'Ruwan Kumara', phone: '0744444444', password: hashedPassword, role: 'employee', basicSalary: 38000, salaryType: 'standard' },
      { name: 'Mrs Sunali', phone: '0755555555', password: hashedPassword, role: 'employee', basicSalary: 60000, salaryType: 'fixed' }
    ]);
    console.log("Created Users...");

    // 3. Customers
    const customers = await Customer.insertMany([
      { name: 'Brandix Lanka Ltd', company: 'Brandix', phone: '0112345678', address: 'Colombo 03', vatNo: 'VAT1001', svatNo: 'SVAT1001' },
      { name: 'MAS Holdings', company: 'MAS', phone: '0119876543', address: 'Colombo 02', vatNo: 'VAT1002', svatNo: 'SVAT1002' },
      { name: 'Hirdaramani Group', company: 'Hirdaramani', phone: '0114567890', address: 'Maharagama', vatNo: 'VAT1003', svatNo: 'SVAT1003' }
    ]);

    // 4. Suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'ECHO Chem Pvt Ltd', tel: '0115555555', address: 'Kelaniya', od: 347750 },
      { name: 'Juki Service Center', tel: '0116666666', address: 'Panchikawatte', od: 124800 },
      { name: 'Ceypetco Fuel Dist.', tel: '0117777777', address: 'Kolonnawa', od: 0 }
    ]);

    // 5. General Expenses (from the Excel sheet)
    const expensesData = [
      { issueNo: 'ISS-2001', date: '2026-06-04', reason: 'For Dry Process materials', amount: 5000, category: 'Production' },
      { issueNo: 'ISS-2002', date: '2026-06-04', reason: 'For Gas', amount: 14800, category: 'Fuel and Gas' },
      { issueNo: 'ISS-2003', date: '2026-06-04', reason: 'Sub Salary', amount: 11932, category: 'Sub Contract' },
      { issueNo: 'ISS-2004', date: '2026-06-07', reason: 'Machine Repair OD', amount: 124800, category: 'Maintains' },
      { issueNo: 'ISS-2005', date: '2026-06-08', reason: 'For Gas', amount: 29600, category: 'Fuel and Gas' },
      { issueNo: 'ISS-2006', date: '2026-06-09', reason: 'For buy Heat gun', amount: 9000, category: 'Production' },
      { issueNo: 'ISS-2007', date: '2026-06-18', reason: 'Buy heater for Boil water', amount: 2000, category: 'Petty Cash' },
      { issueNo: 'ISS-2008', date: '2026-06-19', reason: 'Travel expenses and Bill Book print', amount: 10050, category: 'Transport' },
      { issueNo: 'ISS-2009', date: '2026-06-21', reason: 'Chemical transport', amount: 8000, category: 'Transport' },
      { issueNo: 'ISS-2010', date: '2026-06-21', reason: 'Colombo chem OD', amount: 225000, category: 'Chemicals' },
      { issueNo: 'ISS-2011', date: '2026-06-26', reason: 'Salary advance for Mrs Sunali', amount: 100000, category: 'Salaries' },
      { issueNo: 'ISS-2012', date: '2026-06-31', reason: 'CEO Vehicle service', amount: 18000, category: 'Others' },
      { issueNo: 'ISS-2013', date: '2026-06-31', reason: 'Security Charges', amount: 145700, category: 'Security Charges' }
    ];
    await Expense.insertMany(expensesData);
    
    // Also add Supplier Bills to Expenses collection
    await Expense.insertMany([
      { issueNo: 'ISS-2014', date: '2026-06-09', reason: 'F18765', amount: 347750, category: 'Supplier Bill', supplierId: suppliers[0]._id },
      { issueNo: 'ISS-2015', date: '2026-06-15', reason: 'Machine Parts 502', amount: 124800, category: 'Supplier Bill', supplierId: suppliers[1]._id }
    ]);

    // Supplier Payments
    await Payment.insertMany([
      { date: '2026-06-04', amount: 358250, reference: 'Cheque 10293', type: 'supplier_payment', supplierId: suppliers[0]._id }
    ]);

    // 6. Invoices
    const invoices = await Invoice.insertMany([
      {
        invoiceNo: 'INV-1001', date: '2026-06-05', customerId: customers[0]._id,
        items: [{ styleNo: 'ST-101', description: 'Wash', unitPrice: 250, quantity: 1500, total: 375000 }],
        qty: 1500, amount: 375000, status: 'pending'
      },
      {
        invoiceNo: 'INV-1002', date: '2026-06-10', customerId: customers[1]._id,
        items: [{ styleNo: 'ST-205', description: 'Dry', unitPrice: 300, quantity: 800, total: 240000 }],
        qty: 800, amount: 240000, status: 'paid'
      }
    ]);

    // Customer Payments
    await Payment.insertMany([
      { date: '2026-06-12', amount: 240000, reference: 'Bank Transfer', type: 'customer_receipt', customerId: customers[1]._id }
    ]);

    // 7. GatePasses
    await GatePass.insertMany([
      { gatePassNo: 'GP-5001', date: '2026-06-05', customerId: customers[0]._id, vehicleNo: 'WP-CAA-1234', driverName: 'Saman', items: [{ description: 'Washed Jeans', quantity: 1500, styleNo: 'ST-101' }] },
      { gatePassNo: 'GP-5002', date: '2026-06-10', customerId: customers[1]._id, vehicleNo: 'WP-LI-9876', driverName: 'Nimal', items: [{ description: 'Dry Process Jeans', quantity: 800, styleNo: 'ST-205' }] }
    ]);

    // 8. Production
    await Production.insertMany([
      { date: '2026-06-01', customerId: customers[0]._id, mainProcessType: 'Wash Type', styleNo: 'ST-101', qty: 500, subProcess: 'Enzyme Wash' },
      { date: '2026-06-02', customerId: customers[0]._id, mainProcessType: 'Wash Type', styleNo: 'ST-101', qty: 1000, subProcess: 'Enzyme Wash' },
      { date: '2026-06-08', customerId: customers[1]._id, mainProcessType: 'Dry Process', styleNo: 'ST-205', qty: 800, subProcess: 'Whiskers' },
      { date: '2026-06-15', customerId: customers[2]._id, mainProcessType: 'Dry Process', styleNo: 'ST-300', qty: 2000, subProcess: 'Scraping' }
    ]);

    // 9. Payroll
    await Payroll.insertMany([
      {
        month: '2026-06',
        payrolls: staffMembers.map(emp => ({
          empId: emp._id,
          name: emp.name,
          basicSalary: emp.basicSalary,
          salaryType: emp.salaryType,
          otHours: 10,
          allowance: 2000,
          incentive: 1000,
          advance: 0,
          nonPaidDays: 0,
          perDayRate: emp.basicSalary / 26,
          otRate: (emp.basicSalary / 200) * 1.5,
          netSalary: emp.basicSalary + 2000 + 1000 + (10 * ((emp.basicSalary / 200) * 1.5))
        }))
      }
    ]);

    console.log("✅ Seed Data Inserted Successfully!");
    
  } catch (err) {
    console.error("❌ Seeding Error:", err);
  } finally {
    mongoose.disconnect();
  }
}

seedDB();
