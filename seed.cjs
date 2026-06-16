require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const exists = await User.findOne({ phone: "0763365701" });
    if (!exists) {
      await User.create({
        name: "Admin",
        phone: "0763365701",
        password: "123",
        role: "manager",
        basicSalary: 0,
        salaryType: "fixed"
      });
      console.log('Admin user created: 0763365701 / 123');
    } else {
      console.log('Admin already exists');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
