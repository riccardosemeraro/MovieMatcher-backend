// server.js
const express = require('express');
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');

const app = express();
const PORT = 9000; //process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

app.get('/', (req, res) => {
    console.log('Hello World');
    //res.send('Hello World');
});


//Route per verificare se l'utente è autenticato
app.post('/verify', (req, res) => {
    const user = req.body;

    console.log('Dati ricevuti:', { user });

    if (!user) {
        return res.status(400).json({ message: 'User is required' });
    }

    try {
        //simulazione script di verifica token

        return res.status(200).json({ message: 'User is authenticated', user });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});









// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server avviato su http://localhost:${PORT}`);

});