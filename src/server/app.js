import express from 'express';
import path from 'path';
import userRoutes from './routes/user.routes.js';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, '../client/public');
// console.log('Serving static files from:', publicPath);

app.use(express.static(publicPath));

app.use(`/api/users`, userRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;