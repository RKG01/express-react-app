const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Letter Schema
const letterSchema = new mongoose.Schema({
    sender: String,
    recipient: String,
    message: String,
    userId: mongoose.Schema.Types.ObjectId
});
const Letter = mongoose.model('Letter', letterSchema);

// 🔐 Register
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).send('All fields are required');

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// 🔐 Login & Get Token
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};

// 📩 GET letters (only user’s letters)
app.get('/letters', authenticate, async (req, res) => {
    try {
        const letters = await Letter.find({ userId: req.user.userId });
        res.json(letters);
    } catch (err) {
        console.error('Fetch Letters Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// 📦 POST a letter (Authenticated User)
app.post('/letters', authenticate, async (req, res) => {
    try {
        const { sender, recipient, message } = req.body;
        const newLetter = new Letter({ sender, recipient, message, userId: req.user.userId });
        await newLetter.save();
        res.status(201).json(newLetter);
    } catch (err) {
        console.error('Post Letter Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
