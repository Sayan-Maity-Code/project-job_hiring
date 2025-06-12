import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employeeRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import llmRoutes from './routes/llmRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/llm', llmRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running successfully!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});