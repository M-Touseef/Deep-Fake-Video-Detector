require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const cleanupService = require('./src/services/cleanupService');

const PORT = env.PORT;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    cleanupService.startCleanupScheduler();

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
      console.log(`[ENV] Environment: ${env.NODE_ENV}`);
      console.log(`[ML] Service URL: ${env.ML_SERVICE_URL}`);
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
