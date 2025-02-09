import express from 'express';
// import helmet from 'helmet';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middlewares
// app.use(helmet());
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
// app.use('/', userRoutes);

// Error management
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;