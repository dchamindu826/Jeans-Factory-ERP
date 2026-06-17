require('dotenv').config();
const mongoose = require('mongoose');

async function fixDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("Missing MONGO_URI");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.collections();
    const usersCollection = collections.find(c => c.collectionName === 'users');
    
    if (usersCollection) {
      const indexes = await usersCollection.indexes();
      console.log("Current indexes on users collection:");
      console.log(indexes.map(i => i.name));

      const hasUsernameIndex = indexes.find(i => i.name === 'username_1');
      if (hasUsernameIndex) {
        console.log("Dropping username_1 index...");
        await usersCollection.dropIndex('username_1');
        console.log("Index dropped successfully!");
      } else {
        console.log("username_1 index not found. No need to drop.");
      }
    } else {
      console.log("users collection not found.");
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected.");
  }
}

fixDB();
