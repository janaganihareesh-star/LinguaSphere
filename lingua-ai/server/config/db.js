const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      console.error("❌ Error: Wrong MongoDB password, check .env");
    } else if (error.code === 'ENOTFOUND') {
      console.error("❌ Error: Cannot reach MongoDB Atlas, check internet");
    } else if (error.name === 'MongooseError' || error.name === 'MongoParseError') {
      console.error("❌ Error: Invalid MongoDB connection string in .env");
    } else {
      console.error(`❌ MongoDB Error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
