import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import favRoutes from './src/routes/favorites.js';

dotenv.config();

const app = express();

// CORS: for Expo dev, allow all origins during dev; tighten in prod
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/favorites', favRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
