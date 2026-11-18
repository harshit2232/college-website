const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri);
      console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return conn;
    }

    // Try connecting to default local MongoDB instance with short timeout
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/university_admission', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(` Connected to local MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(' Local MongoDB service not detected. Initializing embedded MongoMemoryServer...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(` Embedded MongoMemoryServer running at: ${memUri}`);
      return conn;
    }
  } catch (error) {
    console.error(` Error connecting to database: ${error.message}`);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error during database disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
