// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const url = 'mongodb+srv://rajarajanshrihari:rajarajan15@database1.ubh3w.mongodb.net/';
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs'); // Replaced bcrypt with bcryptjs
app.use(express.json());
require('dotenv').config();
app.use(cors());
// Middleware
app.use(bodyParser.json());

const SheetSchema = new mongoose.Schema({
  name: String,
  cells: [{
    value: String,
    rowspan: Number,
    colspan: Number,
    isEditable: Boolean,
    isBold: Boolean,
    row: Number,
    col: Number,
    note: String
  }]
});

const Sheet = mongoose.model('Sheet', SheetSchema);

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

const JWT_SECRET = process.env.JWT_SECRET || generateSecretKey();
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment variables. Using a generated secret. This is fine for development, but not recommended for production.');
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || url;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// User model
const User = mongoose.model('User', {
  email: { type: String, unique: true }, // Ensure email is unique too
  username: { type: String, unique: true },
  name: { type: String },
  role: { type: String, enum: ['supervisor', 'operator', 'inspector', 'admin'], default: 'operator' },
  password: String
});

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, role, username, name } = req.body;  // Extract email and password from req.body
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ email, username, name, role, password: hashedPassword });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Send token as response
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Error signing up' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

      // Send token and role to the frontend
      res.json({ token, role: user.role, name: user.name });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.post('/api/save-sheet', async (req, res) => {
  try {
    const sheet = new Sheet(req.body);
    await sheet.save();
    res.json({ id: sheet._id });
  } catch (error) {
    res.status(500).json({ error: 'Error saving sheet' });
  }
});

app.patch('/api/update-sheet/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sheet);
  } catch (error) {
    res.status(500).json({ error: 'Error updating sheet' });
  }
});

app.get('/api/sheets', async (req, res) => {
  try {
    const doc = await Sheet.find();
    res.json(doc);
  } catch (err) {
    res.status(500).json('Error', err);
  }
});

app.delete('/api/deleteall', async (req, res) => {
  try {
    const doc = await Sheet.deleteMany();
    res.json(doc);
  } catch (err) {
    res.status(500).json('Error deleting data!', err);
  }
});

app.get('/api/get-sheet/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    res.json(sheet);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving sheet' });
  }
});

app.delete('/api/delete/:id', async (req, res) => {
  try {
    const removedDoc = await Sheet.findByIdAndDelete(req.params.id);
    res.json(removedDoc);
  } catch (err) {
    res.status(200).json({ error: 'Error removing sheet', err });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
