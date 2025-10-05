import express from 'express';
import prisma from './prisma/lib/prisma.js';
import https from 'https';
import fs from 'fs';
import { initSocket } from './socket/chatSocket.js';
import cors from 'cors';
import cron from 'node-cron';
import { deleteOldEntries } from './utils/cleanOldEntries.js';
import path from 'path';
import { fileURLToPath } from 'url';


import userRoutes from './routes/signupRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import passForgotRoutes from './routes/passForgotRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import pushTokenRoutes from './routes/pushTokenRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lokaler Pfad zu den SSL-Zertifikaten
const options = {
  key: fs.readFileSync('./certsSSL/private.key'),               // PRIVATE KEY!
  cert: fs.readFileSync('./certsSSL/certificate.crt'),       // DOMAIN-CERTIFICATE
  ca: fs.readFileSync('./certsSSL/GlobalSign.crt')  // CHAIN/INTERMEDIATE CERTIFICATE
};


// Database connection
prisma.$connect()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((error) => {
    console.error('❌ Prisma database connection error:', error);
    process.exit(1);
  });

//app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Deploy static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/forgot-password', passForgotRoutes);
app.use('/api', accountRoutes);
app.use('/api/push-token', pushTokenRoutes);
app.use("/api", feedbackRoutes);

// Fallback for invalid routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error in the server:', err);
  res.status(500).json({ error: 'Server error' });
});

// Cronjob for automatic cleanup
cron.schedule('0 0 * * *', () => {
  console.log(`⏰ Start automatic cleanup at ${new Date().toISOString()}`);
  deleteOldEntries();
});

const PORT = process.env.PORT || ****;

// HTTPs servers start on port **** with HTTPS
const server = https.createServer(options, app);

// Initialize WebSocket
initSocket(server);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server läuft auf https://*********.com:****`);
});

// Disconnect Prisma at server end
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
