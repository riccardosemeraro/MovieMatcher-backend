
// Risposta al client o ai clients DEFINITIVI
//socket.emit('rispostaCreazionePartita', 'Partita creata con successo!'); //invia solo al client che ha inviato il messaggio
//io.to(roomId).emit('rispostaCreazionePartita', 'Partita creata con successo!'); //invia a tutti i client collegati alla stanza
//socket.to(roomId).emit('rispostaCreazionePartita', 'Partita creata con successo!'); //invia a tutti i client collegati alla stanza, escluso quello che ha inviato il messaggio

const { get, set } = require('mongoose');
const HistoryMatch = require('../Models/HistoryMatch');
const { getRoomsVariables, setRoomsVariables, getHistoryMatch } = require('../utils/roomsVariabiles');


function creaIdPartita(){ //crea un codice per la partita
    roomId = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return roomId;
}

const creaPartita = async (socket, data) => {
    console.log('Richiesta di creazione partita ricevuta dal client: ', data);
    
    const creatore = data.username; //id dell'utente
    let roomName = data.roomName; //nome della stanza
    //let roomId = data.roomId; //codice della stanza
    let modalita = data.modalita; //tipo di gioco


    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    let oggettoPartecipante = {};
    
    do { //ciclo fino a quando non trovo un codice per la partita non utilizzato
        roomId = creaIdPartita(); //creo un codice per la partita

        //controllo che il codice della partita non sia già stato utilizzato in mongoDB
        const partita = await HistoryMatch.HistoryMatch.findOne({ roomId: roomId }); //cerco il codice della partita in mongoDB

        if (partita === null) { //se il codice della partita non è già stato utilizzato
            break;
        }

    } while (true);

    if (roomName === '' || roomName === null || roomName === undefined) { //sono il creatore della partita ma non ho deciso un nome per la stanza
        roomName = roomId;
    }

    oggettoPartecipante = {
        username: creatore,
        stato: 'Entrato',
        listaFilm: []
    }

    dataCreazione = new Date();

    if (!roomsVariables[roomId]) { //se il codice della partita non è già stato utilizzato
        roomsVariables[roomId] = {
            roomId: roomId,
            roomName: roomName,
            creatore: creatore,
            listaPartecipanti: [],
            listaFilm: [],
            impostazioni: modalita,
            stato: 'Aperta',
            dataCreazione: dataCreazione,
            classifica: [],

            isWriting: false,
            //più variabili della stanza
        };
        roomsVariables[roomId].listaPartecipanti.push(oggettoPartecipante); //aggiungo il creatore alla lista dei partecipanti
    }

    setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze
    console.log("Variabili d'ambiente: ", roomsVariables); //ottengo le variabili delle stanze

    socket.join(roomId); //il client si unisce alla stanza con il codice della partita
    console.log('Il client si è unito alla stanza:', roomId);

    //let dataCreazione = new Date().toLocaleDateString('it-IT', {weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'});
    //console.log('Data di creazione:',  dataCreazione);

    const newMatch = new HistoryMatch.HistoryMatch({
        roomId: roomId,
        roomName: roomName,
        creatore: creatore,
        listaPartecipanti: [],
        listaFilm: [],
        impostazioni: modalita,
        stato: 'Aperta',
        dataCreazione: dataCreazione,
        classifica: []
    });

    newMatch.listaPartecipanti.push(oggettoPartecipante); //aggiungo il creatore alla lista dei partecipanti

    try {
        const savedMatch = await newMatch.save();
        console.log("Match salvato in MongoDB:", { savedMatch });
    } catch (saveError) {
        console.error("Errore durante il salvataggio del Match:", saveError);
    }

    console.log('Lista partecipanti: ', newMatch.listaPartecipanti);
    console.log('Lista partecipanti della stanza:', roomsVariables[roomId].listaPartecipanti);



    const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === creatore);

    const risposta = {
        roomId: roomsVariables[roomId].roomId,
        roomName: roomsVariables[roomId].roomName,
        creatore: roomsVariables[roomId].creatore,
        me: usernameListaFilm,
        listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
        listaFilm: roomsVariables[roomId].listaFilm,
        impostazioni: roomsVariables[roomId].impostazioni,
        stato: roomsVariables[roomId].stato,
        dataCreazione: roomsVariables[roomId].dataCreazione,
        classifica: roomsVariables[roomId].classifica,
    }

    // Risposta al client
    socket.emit('rispostaCreazionePartita', {roomId: roomId, variabiliRoom: risposta, message: 'Partita creata con successo!'});
}

const partecipaPartita = async (socket, io, data) => {
    console.log('Richiesta di partecipazione alla partita ricevuta dal client:', data);

    const username = data.username; //id dell'utente
    let roomName = data.roomName //nome della stanza
    let roomId = data.roomId; //codice della stanza

    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    let oggettoPartecipante = {};

    const partita = await HistoryMatch.HistoryMatch.findOne({ roomId: roomId }); //verifico che esista la partita

    if (partita === null) { //se il codice della partita non è già stato utilizzato
        console.log("Partita non trovata");
        socket.emit('rispostaPartecipazionePartitaNegata', {roomId: roomId, message: 'Partita non trovata!'});
    }
    else if (partita.stato !== 'Aperta') { //se la partita non è più aperta
        console.log("Partita non più aperta");
        socket.emit('rispostaPartecipazionePartitaNegata', {roomId: roomId, message: 'Partita non più aperta!'});
    }/*
    else if ( roomsVariables[roomId].listaPartecipanti.find((partecipante) => partecipante.username === username) !== undefined ) { //se il partecipante è già presente nella lista dei partecipanti
        console.log("Partecipante già presente");
        socket.emit('rispostaPartecipazionePartitaNegata', {roomId: roomId, message: 'Partecipante già presente!'});
    }*/
    else {
        oggettoPartecipante = {
            username: username,
            stato: 'Entrato',
            listaFilm: []
        }

        if ( roomsVariables[roomId].listaPartecipanti.find((partecipante) => partecipante.username === username) === undefined )
        {
            roomsVariables[roomId].listaPartecipanti.push(oggettoPartecipante); //aggiungo il partecipante alla lista dei partecipanti
        }

        setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

        socket.join(roomId); //il client si unisce alla stanza con il codice della partita

        await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { listaPartecipanti: roomsVariables[roomId].listaPartecipanti }); //aggiorno la lista dei partecipanti su mongoDB


        const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === username);

        const risposta = {
            roomId: roomsVariables[roomId].roomId,
            roomName: roomsVariables[roomId].roomName,
            creatore: roomsVariables[roomId].creatore,
            me: usernameListaFilm,
            listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
            listaFilm: roomsVariables[roomId].listaFilm,
            impostazioni: roomsVariables[roomId].impostazioni,
            stato: roomsVariables[roomId].stato,
            dataCreazione: roomsVariables[roomId].dataCreazione,
            classifica: roomsVariables[roomId].classifica,
        }

        io.to(roomId).emit('rispostaPartecipaPartita', {roomId: roomId, variabiliRoom: risposta, message:'Partita creata con successo!'}); //invia a tutti i client collegati alla stanza
    }

}

const invioListaFilm = async (socket, data) => {
    console.log('Richiesta di invio lista film ricevuta dal client:', data);

    const username = data.username; //id dell'utente
    const roomId = data.roomId; //codice della stanza
    const roomName = data.roomName; //nome della stanza
    const listaFilm = data.listaFilm; //lista dei film

    socket.join(roomId); //il client si unisce alla stanza con il codice della partita

    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    roomsVariables[roomId].listaPartecipanti.map((partecipante) => {
        if (partecipante.username === username) {
            partecipante.listaFilm = listaFilm;
            partecipante.stato = 'Pronto';
        }
    });

    await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { listaPartecipanti: roomsVariables[roomId].listaPartecipanti }); //aggiorno la lista dei partecipanti su mongoDB

    setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

    const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === username);

    const risposta = {
        roomId: roomsVariables[roomId].roomId,
        roomName: roomsVariables[roomId].roomName,
        creatore: roomsVariables[roomId].creatore,
        me: usernameListaFilm,
        listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
        listaFilm: roomsVariables[roomId].listaFilm,
        impostazioni: roomsVariables[roomId].impostazioni,
        stato: roomsVariables[roomId].stato,
        dataCreazione: roomsVariables[roomId].dataCreazione,
        classifica: roomsVariables[roomId].classifica,
    }

    console.log('Risposta:', risposta.listaPartecipanti.listaFilm);

    // Risposta al client
    socket.emit('rispostaInvioLista', {roomId: roomId, variabiliRoom: risposta, message: 'Dati inviati con successo'});
}

const statoPartecipantiPronto = async (socket, data) => { //funzione per verificare se tutti i partecipanti sono pronti (da utilizzare prima di clicare su "Avvia partita" nel popoup)

    console.log('Richiesta di stato partecipanti ricevuta dal client:', data);

    const roomId = data.roomId; //codice della stanza

    socket.join(roomId);

    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    let risposta = true;

    roomsVariables[roomId].listaPartecipanti.map((partecipante) => {
        if(partecipante.stato !== 'Pronto'){
            risposta = false;
        }
    });
    
    // Risposta al client
    socket.emit('rispostaStatoPartecipantiPronto', {roomId: roomId, risposta: risposta, message: 'Stato partecipanti inviato con successo'});
}

const avviaPartita = async (socket, io, data) => { //funzione per avviare la partita (da mettere nel popup "Avvia partita" se tutti i partecipanti sono pronti o se il creatore vuole continuare comunque anche se non tutti sono pronti)
    console.log('Richiesta di avvio partita ricevuta dal client:', data);

    const username = data.username;
    const roomId = data.roomId; //codice della stanza

    socket.join(roomId);

    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    roomsVariables[roomId].stato = 'In corso';

    roomsVariables[roomId].listaPartecipanti.map((partecipante) => {
        //console.log('Partecipante:', partecipante);

        partecipante.listaFilm.map((film) => {
            //console.log('Film:', film);

            const oggettoFilm = {
                film: film,
                punteggi: []
            }

            roomsVariables[roomId].listaFilm.push(oggettoFilm);
        });
    });

    //setto il vettore dei punteggi per ogni film di tanti zeri quanti sono i partecipanti
    const numeroPartecipanti = roomsVariables[roomId].listaPartecipanti.length;
    roomsVariables[roomId].listaFilm.map((film) => {
        let cont = 0;
        while (cont < numeroPartecipanti){
            film.punteggi.push(0);
            cont++;
        }
    });

    //console.log('Lista film gioco:', roomsVariables[roomId].listaFilm); //LISTA CON POSSIBILI DUPLICATI DA ELIMINARE

    //voglio eliminare i duplicati da listaFilmGioco sulla base dell'id
    roomsVariables[roomId].listaFilm = roomsVariables[roomId].listaFilm.filter((film, index, self) =>
        index === self.findIndex((element) => (
            element.film.id === film.film.id
        ))
    );
    console.log('Lista film gioco ULTIMA:', roomsVariables[roomId].listaFilm); //LISTA FILM SENZA DUPLICATI



    //INIZIO A CREARE LA CLASSIFICA (mi serve per fare la somma dei punteggi)

    roomsVariables[roomId].classifica = [];

    roomsVariables[roomId].listaFilm.map((elemento) => {

        const oggettoFilmClassifica = {
            film: elemento.film,
            punteggio: 0
        }

        roomsVariables[roomId].classifica.push(oggettoFilmClassifica);
    });

    console.log('Classifica:', roomsVariables[roomId].classifica);

    setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

    await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { stato: roomsVariables[roomId].stato, listaFilm: roomsVariables[roomId].listaFilm, classifica: roomsVariables[roomId].classifica }); //aggiorno la lista dei film su mongoDB


    const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === username);

    const risposta = {
        roomId: roomsVariables[roomId].roomId,
        roomName: roomsVariables[roomId].roomName,
        creatore: roomsVariables[roomId].creatore,
        me: usernameListaFilm,
        listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
        listaFilm: roomsVariables[roomId].listaFilm,
        impostazioni: roomsVariables[roomId].impostazioni,
        stato: roomsVariables[roomId].stato,
        dataCreazione: roomsVariables[roomId].dataCreazione,
        classifica: roomsVariables[roomId].classifica,
    }

    io.to(roomId).emit('rispostaAvviaPartita', {roomId: roomId, variabiliRoom: risposta, message:'Partita creata con successo!'}); //invia a tutti i client collegati alla stanza

}

const inviaPunteggi = async (socket, io, data, roomsVariables) => {
    console.log('Richiesta di invio punti ricevuta dal client:', data);

    const username = data.username;
    const roomId = data.roomId; //codice della stanza
    const punteggi = data.punteggi;

    socket.join(roomId);

    //let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze
    console.log('roomVariables:', roomsVariables);
    console.log('roomId:', roomId);
    console.log('punteggi:', punteggi);
    console.log('listaPartecipanti:', roomsVariables[roomId].listaPartecipanti);

    //voglio individuare la posizione di un elemento nella lista dei partecipanti
    const posizionePartecipante = await roomsVariables[roomId].listaPartecipanti.findIndex(partecipante => partecipante.username === username);

    let i = 0;
    roomsVariables[roomId].listaFilm.map((elemento) => {
        elemento.punteggi[posizionePartecipante] = punteggi[i];
        i++;
    });
    //console.log('Lista film con punteggi:', roomsVariables[roomId].listaFilm);

    //inizio subito a fare la somma dei punteggi per la classifica
    roomsVariables[roomId].classifica.map((elemento) => {
        
        roomsVariables[roomId].listaFilm.map((film) => {
            if(film.film.id === elemento.film.id){
                elemento.punteggio = film.punteggi.reduce((accumulatore, valoreCorrente) => accumulatore + valoreCorrente, 0);
            }
        });

    });
    //console.log('Classifica:', roomsVariables[roomId].classifica);

    //aggiorno lo stato del partecipante
    roomsVariables[roomId].listaPartecipanti.map((partecipante) => {
        if(partecipante.username === username){
            partecipante.stato = 'Votato';
        }
    });

    setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

    await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { listaFilm: roomsVariables[roomId].listaFilm, classifica: roomsVariables[roomId].classifica, listaPartecipanti: roomsVariables[roomId].listaPartecipanti }); //aggiorno la lista dei film su mongoDB

    

    // PARTE SUCCESSIVA: INVIO RISPOSTA AL CLIENT
    //CONTROLLO PER CAPIRE COSA MANDARE AL CLIENT (sulla base se hanno votato tutti o no)

    let rispostaStatoPartecipantiVotato = true;

    roomsVariables[roomId].listaPartecipanti.map((partecipante) => {
        if(partecipante.stato !== 'Votato'){
            risposta = false;
        }
    });

    
    if(rispostaStatoPartecipantiVotato !== true){ //quindi se non è ancora il caso di calcolare la classifica

        const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === username);

        const risposta = {
            roomId: roomsVariables[roomId].roomId,
            roomName: roomsVariables[roomId].roomName,
            creatore: roomsVariables[roomId].creatore,
            me: usernameListaFilm,
            listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
            listaFilm: roomsVariables[roomId].listaFilm,
            impostazioni: roomsVariables[roomId].impostazioni,
            stato: roomsVariables[roomId].stato,
            dataCreazione: roomsVariables[roomId].dataCreazione,
            classifica: roomsVariables[roomId].classifica,
        }

        socket.emit('rispostaInviaPunteggi', {roomId: roomId, variabiliRoom: risposta, message: 'Punteggi inviati con successo'});

    } else { //se è il caso di calcolare la classifica e inviarla ai client

        //ORDINO LA CLASSIFICA IN BASE AI PUNTEGGI (in ordine decrescente)
        roomsVariables[roomId].classifica = roomsVariables[roomId].classifica.sort((a, b) => b.punteggio - a.punteggio);

        console.log('Classifica ordinata:', roomsVariables[roomId].classifica);

        setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

        roomsVariables[roomId].stato = 'Terminata';

        await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { classifica: roomsVariables[roomId].classifica, stato: roomsVariables[roomId].stato }); //aggiorno la classifica su mongoDB


        //VEDO SE CI SONO PARIMERITO NELLA CLASSIFICA
        const punteggioMassimo = roomsVariables[roomId].classifica[0].punteggio;
        let parimerito = false;
        let parimeritoClassifica = []; //vettore che conterrà i parimerito
        let count = 0;

        roomsVariables[roomId].classifica.map((elemento) => {
            if(elemento.punteggio === punteggioMassimo){
                parimerito = true;
                count++;
                parimeritoClassifica.push(elemento);
            }
        });

        if(parimerito === true && count > 1){ //se ci sono dei parimerito nella classifica
            //gestione numero casuale per i parimerito

            const lunghezzaParimerito = parimeritoClassifica.length;

            //voglio generare un numero casuale tra 1 e 1000
            const numeroCasuale = Math.floor(Math.random() * 1000) + 1;

            //calcolo l'indice del parimerito che vincerà (sostanzialmente la posizione del vettore che contiene il vincitore)
            const indiceParimerito = numeroCasuale % lunghezzaParimerito;

            //a questo punto vorrei che l'elemento con indice indiceParimerito si trovi in testa al vettore
            const elementoVincitore = parimeritoClassifica[indiceParimerito];

            roomsVariables[roomId].classifica[indiceParimerito] = parimeritoClassifica[0]; //metto quello in testa alla positione indiceParimerito

            roomsVariables[roomId].classifica[0] = elementoVincitore; //metto il vincitore in testa

            setRoomsVariables(roomsVariables); //aggiorno le variabili delle stanze

            roomsVariables[roomId].stato = 'Terminata';

            await HistoryMatch.HistoryMatch.findOneAndUpdate({ roomId: roomId }, { classifica: roomsVariables[roomId].classifica }); //aggiorno la classifica su mongoDB


            //invio i dati (oltre i classici) per poter visualizzare la ruota della fortuna poi il vincitore
            io.to(roomId).emit('rispostaInviaRuota', {roomId: roomId, risposta: roomsVariables[roomId], vincitore: parimeritoClassifica[indiceParimerito], parimeritoClassifica: parimeritoClassifica, message: 'Classifica inviata con successo'}); //invia a tutti i client collegati alla stanza
            //ID - VAR ROOM - VINCITORE - POSIZIONE DEL VINCITORE - PARIMERITI(FILM CON STESSO PUNTEGGIO)

            //parimeritoClassifica e indiceParimerito serviranno per la ruota della fortuna

        } else { //se non ci sono parimerito nella classifica

            io.to(roomId).emit('rispostaInviaClassificaVincitore', {roomId: roomId, risposta: roomsVariables[roomId], vincitore: roomsVariables[roomId].classifica[0], message: 'Classifica inviata con successo'}); //invia a tutti i client collegati alla stanza

        }


    }

    
    
    
}

const getRoom = async (socket, data) => {
    
    console.log('Richiesta di stanza ricevuta dal client:', data);

    const roomId = data.roomId; //codice della stanza
    const username = data.username; //id dell'utente

    socket.join(roomId); //il client si unisce alla stanza con il codice della partita

    let roomsVariables = await getRoomsVariables(); //ottengo le variabili delle stanze

    const usernameListaFilm = roomsVariables[roomId].listaPartecipanti.find(partecipante => partecipante.username === username);

    const risposta = {
        roomId: roomsVariables[roomId].roomId,
        roomName: roomsVariables[roomId].roomName,
        creatore: roomsVariables[roomId].creatore,
        me: usernameListaFilm,
        listaPartecipanti: roomsVariables[roomId].listaPartecipanti,
        listaFilm: roomsVariables[roomId].listaFilm,
        impostazioni: roomsVariables[roomId].impostazioni,
        stato: roomsVariables[roomId].stato,
        dataCreazione: roomsVariables[roomId].dataCreazione,
        classifica: roomsVariables[roomId].classifica,
    }

    socket.emit('rispostaGetRoom', {roomId: roomId, variabiliRoom: risposta, message: 'Room inviata con successo'});
}



module.exports = 
                {
                    creaPartita,
                    partecipaPartita,
                    invioListaFilm,
                    statoPartecipantiPronto,
                    avviaPartita,
                    inviaPunteggi,
                    getRoom          
                };