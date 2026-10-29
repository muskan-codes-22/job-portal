import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

import app from './app.js';
import connectDatabase from './config/database.js';

const port = process.env.PORT || 5000;
await connectDatabase();
app.listen(port, () => console.log(`API listening on ${port}`));
