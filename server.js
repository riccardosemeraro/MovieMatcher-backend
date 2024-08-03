// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const databaseConnection = require('./Routes/databaseConnection');

//verifica che il token ricevuto da Auth0 sia valido
const jwtCheck = auth({
    audience: 'moviematcher-certificate',
    issuerBaseURL: 'https://dev-u3m6ogvornq7wv88.us.auth0.com',
    tokenSigningAlg: 'RS256'
});

const app = express();
const PORT = 9000; //process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(jwtCheck);

app.get('/', (req, res) => {
    console.log('Hello World');
    //res.send('Hello World');
});


//Route per verificare se l'utente è autenticato
app.use('/user', databaseConnection);









// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server avviato su http://localhost:${PORT}`);

});