import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import procurementRoutes from './routes/procurement';
import bidRoutes from './routes/bids';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';
import weatherRoutes from './routes/weather';
import mandiRoutes from './routes/mandi';
import advisoryRoutes from './routes/advisory';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'KhetSetu AI-Assisted Agricultural Marketplace & Procurement Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Real-time Socket.IO Handlers
io.on('connection', (socket) => {
  // Join a personal user room for direct notifications
  socket.on('join_user', (userId: string) => {
    socket.join(`user_${userId}`);
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Handle incoming live chat message
  socket.on('send_message', (data: { conversationId: string; message: any }) => {
    // Broadcast to room
    io.to(`conversation_${data.conversationId}`).emit('new_message', data.message);
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

server.listen(PORT, () => {
  console.log(`🌾 KhetSetu Backend Server running on port ${PORT}`);
  console.log(`🛰️ WebSocket Server ready for real-time messaging & bidding`);
});
