const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-ecommerce');
    console.log(`\x1b[32m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[Database] Connection Error: ${error.message}\x1b[0m`);
    console.log('\x1b[33m[Database] Please ensure MongoDB is installed and running locally, or update MONGO_URI in your .env file.\x1b[0m');
    // We don't exit the process immediately, so the server can run and show connection status in API endpoints.
  }
};

module.exports = connectDB;
