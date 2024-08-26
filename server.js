// server.js

if (process.env.LOCAL_ENV === 'locale') {
    require('dotenv').config(); //carica le variabili d'ambiente da .env in locale (test)
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const mongoose = require('mongoose');

const databaseConnection = require('./Routes/databaseConnection'); //per i collegamenti a MongoDB
const tmdbConnection = require('./Routes/tmdbConnection'); //per i collegamenti a TMDB

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
//app.use(jwtCheck);


app.get('/', (req, res) => {
    console.log('Il server è attivo');
    res.status(200).send('Il server è attivo');
});




//Route per verificare se l'utente è autenticato
app.use('/user', jwtCheck, databaseConnection);
app.use('/tmdb', tmdbConnection);





// Connect to MongoDB
mongoose.connect("mongodb+srv://riccardosemeraro:moviematcher2024@cinematch.09sxqus.mongodb.net/MovieMatcher",)
    .then(() => {
        console.log("Connected to MongoDB");

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Server avviato su http://localhost:${PORT}`);
        });
    }).catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });


