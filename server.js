// server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

//Route per verificare se l'utente è autenticato
app.post('/verify', (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return res.status(200).json({ message: 'User is authenticated', user: decoded });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});