require('dotenv').config();
const mongoose = require('mongoose');

async function checkDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    console.log("ALL USERS:", JSON.stringify(allUsers, null, 2));

    const settingsCollection = db.collection('settings');
    const settings = await settingsCollection.find({}).toArray();
    console.log("SETTINGS:", JSON.stringify(settings, null, 2));
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
}
checkDB();
