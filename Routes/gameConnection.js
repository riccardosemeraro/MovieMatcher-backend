/*Inizio configurazione Socket.io*/
    //const express = require('express');
    //const app = express();
    //const socketIo = require('socket.io');
    //const http = require('http');
    //const server = http.createServer(app);
    //const io = socketIo(server);
/*Fine configurazione Socket.io*/

const express = require('express');
const router = express.Router();

const controllerGame = require('../Controllers/gameConnectionController');

router.get('/', (req, res) => {

    const io = req.io; //istanza di socket.io passata dal middleware

    // Socket.io
    // Gestione delle connessioni WebSocket

    io.on('connection', (socket) => {
        console.log('Un nuovo client si è connesso');

        // Gestisci l'evento 'saluto' dal client
        socket.on('saluto', controllerGame.saluto);

        // Gestisci l'evento 'messaggio'
        socket.on('messaggio', controllerGame.messaggio);

        // Gestisci l'evento 'richiestaTempo'
        socket.on('richiestaTempo', controllerGame.richiestaTempo);

        // Gestione della disconnessione
        socket.on('disconnect', () => {
            console.log('Il client si è disconnesso');
        });
    });

});

module.exports = router; //Esporta il server di Socket.io per poterlo utilizzare in server.js