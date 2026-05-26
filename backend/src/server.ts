import "dotenv/config";
import express, { type Express } from "express";
import cors from 'cors';
import { config } from "./config/env.js";
import cookieParser from "cookie-parser";
import { authRoutes, historyRoutes } from './routes/index.js';

const app: Express = express();
const port = config.port;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))

app.get('/health', (req, res) => {
    res.json({ status: 'API is Running' });
})

app.use('/api/auth', authRoutes);

app.use('/api/history', historyRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});