import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;  // ✅ 이름 통일
if (!uri) {
  console.error('[db] Missing MONGO_URI in .env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

// ✅ 여기서 바로 toilet_app 지정
mongoose.connect(uri, { dbName: 'toilet_app' })
  .then(() => console.log('[db] connected'))
  .catch((err) => {
    console.error('[db] connection error', err);
    process.exit(1);
  });
