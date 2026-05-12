import './config/env.js';
import app from './app.js';
import env from './config/env.js';
import prisma from './config/prisma.js';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
