require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const activityRoutes = require('./routes/activityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

console.log('Attempting to connect to DB...');
connectDB();
console.log('Database connection initiated (async)');

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

console.log(process.env.MONGO_URI);

app.get('/api/health-check', (req, res) => res.json({ success: true, message: 'Server is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/report', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => {
    console.log(`🚀 Server fully up and running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}/api/health-check`);
});

module.exports = app;