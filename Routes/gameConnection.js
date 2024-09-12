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

const { getRoomsVariables, setRoomsVariables } = require('../utils/roomsVariabiles');
const controllerGame = require('../Controllers/gameConnectionController');


router.get('/', (req, res) => { //Gestisce le richieste GET alla radice del percorso '/game'

    const io = req.io; //istanza di socket.io passata dal middleware

    let room = req.query.room || ''; //parametro passato nella richiesta GET

    let roomName = room.split('-')[0]; //nome della stanza
    let roomId = room.split('-')[1]; //codice della stanza

    // Socket.io
    // Gestione delle connessioni WebSocket

    io.on('connection', (socket) => {
        console.log('Un nuovo client si è connesso');

        /*
        if(roomId !== '') {
                socket.join(roomName); //il client si unisce alla stanza con il codice della partita
                console.log('Il client si è unito alla stanza:', roomName);
        }
        */
    
        socket.on('creaPartita', controllerGame.creaPartita);

        socket.on('partecipaPartita', controllerGame.partecipaPartita);

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