const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Log database name
    console.log(`Database Name: ${conn.connection.name}`.green.bold);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`.red.bold);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow.bold);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination'.blue.bold);
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`Database connection failed: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;