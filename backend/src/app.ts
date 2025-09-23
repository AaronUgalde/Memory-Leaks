import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import authRoutes from './routes/auth';
import ownerRoutes from './routes/owners';
import phoneRoutes from './routes/phones';
import petRoutes from './routes/pets';
import docRoutes from './routes/documents';
import vacRoutes from './routes/vaccinations';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL, // cambiar segun tu frontend
  credentials: true, // importante si usas cookies httpOnly
}));
app.use(express.json());
app.use(cookieParser());
// routes
app.use('/api/auth', authRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/pet-docs', docRoutes);
app.use('/api/pet-vaccinations', vacRoutes);

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// error handler simple
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
