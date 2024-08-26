// server.js

if (process.env.LOCAL_ENV === 'locale') {
    require('dotenv').config(); //carica le variabili d'ambiente da .env in locale (test)
}

const socketIo = require('socket.io'); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const mongoose = require('mongoose');

const app = express();
const PORT = 9000; //process.env.PORT || 3000;

const databaseConnection = require('./Routes/databaseConnection'); //per i collegamenti a MongoDB
const tmdbConnection = require('./Routes/tmdbConnection'); //per i collegamenti a TMDB

const gameConnection = require('./Routes/gameConnection'); //per i collegamenti a Socket.io


/*Inizio configurazione Socket.io*/
const http = require('http'); //richiede il modulo http
const server = http.createServer(app); //crea il server http
const io = socketIo(server); //inizializza socket.io sul server http
/*Fine configurazione Socket.io*/


//verifica che il token ricevuto da Auth0 sia valido
const jwtCheck = auth({
    audience: 'moviematcher-certificate',
    issuerBaseURL: 'https://dev-u3m6ogvornq7wv88.us.auth0.com',
    tokenSigningAlg: 'RS256'
});


// Middleware per passare l'istanza di socket.io a tutte le route
const socketIoMiddleware = (req, res, next) => {
    req.io = io;
    next(); //passa il controllo alla route successiva
}


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


app.use('/game', socketIoMiddleware, gameConnection); //socket.io

/* //sul frontend

import { io } from 'socket.io-client';

const SOCKET_IO_URL = 'http://localhost:9000/game';

//all'interno della componente o pagina che vuole utilizzare socket.io

const [socket, setSocket] = useState(null);
const [greetingResponse, setGreetingResponse] = useState('');
const [messageResponse, setMessageResponse] = useState('');
const [timeResponse, setTimeResponse] = useState('');

useEffect(() => {
// Connessione al server Socket.io
const newSocket = io(SOCKET_IO_URL);
setSocket(newSocket);
}, []); // Eseguito solo al primo render
  
useEffect(() => {
    if (socket) {
      // Ascolta l'evento 'rispostaSaluto' dal server
      socket.on('rispostaSaluto', (data) => {
        setGreetingResponse(data);
      });

      // Ascolta l'evento 'rispostaMessaggio' dal server
      socket.on('rispostaMessaggio', (data) => {
        setMessageResponse(data);
      });

      // Ascolta l'evento 'rispostaTempo' dal server
      socket.on('rispostaTempo', (data) => {
        setTimeResponse(data);
      });
    }
  }, [socket]); // Eseguito quando socket cambia

  const sendGreeting = () => {
    if (socket) {
      socket.emit('saluto', { nome: 'Riccardo' });
    }
  };

  const sendMessage = () => {
    if (socket) {
      socket.emit('messaggio', { text: 'Questo è un messaggio dal client' });
    }
  };

  const requestTime = () => {
    if (socket) {
      socket.emit('richiestaTempo');
    }
  };

  return ( //Simulazione di un client di un gioco multiplayer
    <div>
      <h1>Client di Socket.io Game</h1>
      <button onClick={sendGreeting}>Invia Saluto</button>
      <p>Risposta Saluto: {greetingResponse}</p>
      
      <button onClick={sendMessage}>Invia Messaggio</button>
      <p>Risposta Messaggio: {messageResponse}</p>
      
      <button onClick={requestTime}>Richiedi Tempo</button>
      <p>Risposta Tempo: {timeResponse}</p>
    </div>
  );

*/

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