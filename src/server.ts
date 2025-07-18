import mongoose from 'mongoose';
import app from './app.js';
import dotenv from 'dotenv';
import { config } from './common/utils/config.js';
import type { Server } from 'http';

dotenv.config({ path: './.env' });

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
  process.exit(1);
});

const db = config.DATABASE.replace('<db_password>', config.DATABASE_PASSWORD);

const startServer = async (): Promise<void> => {
  try {
    await mongoose.connect(db);

    console.log('MongoDB connected');

    const port = config.PORT || 8080;
    const server: Server = app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('UNHANDLED REJECTION!');
      if (reason instanceof Error) {
        console.error(reason.name, reason.message);
      } else {
        console.error(reason);
      }
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err) {
    console.error('MongoDB not connected', err);
    process.exit(1);
  }
};

startServer();
