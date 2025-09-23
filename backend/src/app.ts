import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import authRoutes from './routes/auth';
import walletRoutes from './routes/wallets';
import usersSearchRoutes from './routes/search';
import getUserByIdRouter from './routes/get_user_by_id';
import donationRoutes from './routes/donations';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL, // cambiar segun tu frontend
  credentials: true, // importante si usas cookies httpOnly
}));
app.use(express.json());
app.use(cookieParser());
// routes
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api', getUserByIdRouter);
app.use('/api/usersSearch', usersSearchRoutes);
app.use('/api/donations', donationRoutes);

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// error handler simple
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
