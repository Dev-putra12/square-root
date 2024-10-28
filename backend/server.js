const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

// Validasi MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB dengan proper error handling
const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    db = client.db('square-root');

    // Handle disconnect
    client.on('error', (error) => {
      console.error('MongoDB client error:', error);
    });

    client.on('close', () => {
      console.log('MongoDB connection closed');
      // Attempt to reconnect
      setTimeout(connectDB, 5000);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Retry connection after delay
    setTimeout(connectDB, 5000);
  }
};

// Initialize DB connection
connectDB();

// Middleware to check if DB is connected
const checkDB = (req, res, next) => {
  if (!db) {
    return res.status(500).json({ message: 'Database connection not established' });
  }
  next();
};

// Apply checkDB middleware to all routes that need DB access
app.post('/api/auth/register', checkDB, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const existingUser = await db.collection('user').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await db.collection('user').insertOne(newUser);
    
    const token = jwt.sign(
      { userId: result.insertedId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', checkDB, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.collection('user').findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/sqrt', checkDB, async (req, res) => {
  try {
    console.log('Received request:', req.body);

    const { number, method } = req.body;
    const input = parseFloat(number);

    if (isNaN(input)) {
      console.log('Invalid input received:', number);
      return res.status(400).json({ error: 'Invalid input. Please provide a valid number.' });
    }

    console.log('Calculating square root for:', input, 'using method:', method);

    const startTime = process.hrtime();
    let result;

    if (method === 'function') {
      result = Math.sqrt(input);
    } else if (method === 'api') {
      await new Promise(resolve => setTimeout(resolve, 100));
      result = Math.sqrt(input);
    } else {
      return res.status(400).json({ error: 'Invalid method. Use "function" or "api".' });
    }

    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;

    const calculationData = {
      input,
      result,
      method,
      timestamp: new Date(),
      executionTime
    };

    await db.collection('calculations').insertOne(calculationData);
    console.log('Calculation saved to database');

    res.json({
      result,
      executionTime
    });
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'An error occurred during calculation.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    dbConnected: !!db
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
