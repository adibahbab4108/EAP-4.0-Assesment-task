import app from './index';
import { prisma } from './prisma/client';
import { config } from './config/config';

const PORT = parseInt(config.PORT, 10) || 5000;

async function startServer() {
  try {
    console.log('Connecting to MongoDB via Prisma...');
    await prisma.$connect();
    console.log('Connected to MongoDB successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server:', error);
    process.exit(1);
  }
}

startServer();
