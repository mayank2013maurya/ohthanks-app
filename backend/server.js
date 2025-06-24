const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const winston = require('winston');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const inquiryRoutes = require('./routes/inquiry');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contacts');
const legalRoutes = require('./routes/legal');
const newsletterRoutes = require('./routes/newsletter');

// Load environment variables
dotenv.config();

const app = express();


// Logger setup
let logger;
if(process.env.NODE_ENV === 'production') {
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
      new winston.transports.Console(),
    ],
  });
} else {
  // Development logger
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
}

// Middleware
app.use(cors({origin: ['https://ohthanks.in', 'http://ohthanks.in']}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
})
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    logger.error('Please check if MongoDB is running and the connection string is correct');
    process.exit(1); // Exit if we can't connect to database
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Check and create admin on first run
const initializeAdmin = async () => {
  try {
    // Wait for MongoDB connection to be ready
    if (mongoose.connection.readyState !== 1) {
      logger.info('Waiting for MongoDB connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new User({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        whatsappNumber: process.env.ADMIN_WHATSAPP,
        password: hashedPassword,
        role: 'admin',
        isVerified: true, // Admin is automatically verified
      });
      await admin.save();
      logger.info('Admin account created successfully');
    } else {
      logger.info('Admin account already exists');
    }
  } catch (err) {
    logger.error('Error initializing admin:', err);
  }
};

// Run admin initialization
initializeAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${err.stack}`);
  res.status(500).json({ message: 'Server error', error: err });
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));