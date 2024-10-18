const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('square-root');
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Registration route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection('user').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      email,
      password: hashedPassword
    };
    
    // Save user to database
    await db.collection('user').insertOne(newUser);
    
    // Create and send token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await db.collection('user').findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/sqrt', async (req, res) => {
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
    // Simulasi API call dengan setTimeout
    await new Promise(resolve => setTimeout(resolve, 100));
    result = Math.sqrt(input);
  } else {
    return res.status(400).json({ error: 'Invalid method. Use "function" or "api".' });
  }

  const endTime = process.hrtime(startTime);
  const executionTime = (endTime[0] * 1e9 + endTime[1]) / 1e6; // Convert to milliseconds

  console.log('Calculation result:', result);

  const calculationData = {
    input: input,
    result: result,
    method: method,
    timestamp: new Date(),
    executionTime: executionTime
  };

  try {
    await db.collection('calculations').insertOne(calculationData);
    console.log('Calculation saved to database');

    res.json({
      result: result,
      executionTime: executionTime
    });
  } catch (error) {
    console.error('Error saving calculation:', error);
    res.status(500).json({ error: 'An error occurred while saving the calculation.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});