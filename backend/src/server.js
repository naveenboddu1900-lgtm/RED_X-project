require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Self-executing server bootstrap
const bootstrap = async () => {
  // Connect database
  await connectDB();

  // Listen
  const server = app.listen(PORT, () => {
    console.log(`\n\x1b[36m====================================================\x1b[0m`);
    console.log(`\x1b[35m[Server] Running in ${process.env.NODE_ENV || 'development'} mode\x1b[0m`);
    console.log(`\x1b[32m[Server] Port: http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36m====================================================\x1b[0m\n`);
  });

  // Handle system crash events gracefully
  process.on('unhandledRejection', (err, promise) => {
    console.error(`\x1b[31m[Critical] Unhandled Rejection Error: ${err.message}\x1b[0m`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

bootstrap();
