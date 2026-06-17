const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple Login (No bcrypt for now to match current frontend behavior, will add bcrypt later if needed)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Find user
    const user = await User.findOne({ phone });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    // In a real production app, we would sign a JWT here. 
    // For this migration phase, we'll return the user object to match the GlobalContext behavior.
    res.status(200).json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      basicSalary: user.basicSalary,
      salaryType: user.salaryType
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all staff (Managers only usually)
router.get('/staff', async (req, res) => {
  try {
    const staff = await User.find().select('-password'); // Exclude passwords
    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// Create new staff
router.post('/staff', async (req, res) => {
  try {
    const newStaff = new User(req.body);
    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create staff', error: err.message || err.toString() });
  }
});

// Update staff
router.put('/staff/:id', async (req, res) => {
  try {
    const updatedStaff = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedStaff);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update staff' });
  }
});

// Delete staff
router.delete('/staff/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete staff' });
  }
});

module.exports = router;
