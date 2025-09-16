import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('[db] Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose.set('strictQuery', true);
mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'toilet_app' })
  .then(() => console.log('[db] connected'))
  .catch((err) => {
    console.error('[db] connection error', err);
    process.exit(1);
  });
