const { get } = require('mongoose');
const HistoryMatch = require('../Models/HistoryMatch');

//voglio tutti i dati che sono presenti nella tabella historyMatch su mongoDB
async function getHistoryMatch() {
    
    //voglio tutti i dati di una collezione su mongodb
    const collezione = await HistoryMatch.HistoryMatch.find({});

    const roomsVariables2 = {};

    //console.log('Collezione:', collezione);

    collezione.map((room) => {
        roomsVariables2[room.roomId] = {
            roomId: room.roomId,
            roomName: room.roomName,
            creatore: room.creatore,
            listaPartecipanti: room.listaPartecipanti,
            listaFilm: room.listaFilm,
            impostazioni: room.impostazioni,
            stato: room.stato,
            dataCreazione: room.dataCreazione,
            classifica: room.classifica,

            isWriting: false,
            //più variabili della stanza
        };

        //console.log('Variabili relative alla stanza ' + room.roomId + ':', roomsVariables2[room.roomId]);
    });
        
    return roomsVariables2;
}


// Variabile privata
let _roomsVariables = getHistoryMatch() || {};


// getter per la variabile privata
async function getRoomsVariables() {
    _roomsVariables = await getHistoryMatch();
    return _roomsVariables;
}

// setter per la variabile privata
function setRoomsVariables(value) {
    _roomsVariables = value;
}

// Esporta le funzioni
module.exports = {
    getRoomsVariables,
    setRoomsVariables
};