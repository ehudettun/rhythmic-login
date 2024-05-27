const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static assets
app.use(express.static('static'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    intervals: [Number]
});

// Create unique index for username
userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { username, password, intervals } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, intervals });
    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: 'Username already exists' });
        } else {
            res.status(400).json({ message: 'Error registering user', error: err.message });
        }
    }
});

app.post('/login', async (req, res) => {
    const { username, password, intervals } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const rhythmMatch = compareIntervals(user.intervals, intervals);

    if (rhythmMatch) {
        res.status(200).json({ message: 'Login successful!' });
    } else {
        res.status(400).json({ message: 'Invalid typing rhythm' });
    }
});

function compareIntervals(storedIntervals, inputIntervals) {
    if (storedIntervals.length !== inputIntervals.length) return false;

    let totalDifference = 0;
    for (let i = 0; i < storedIntervals.length; i++) {
        totalDifference += Math.abs(storedIntervals[i] - inputIntervals[i]);
    }

    const averageDifference = totalDifference / storedIntervals.length;
    return averageDifference < 100; // Adjust this threshold as needed
}

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
