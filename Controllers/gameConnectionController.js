
const saluto = async (socket, data) => {
    console.log('Saluto ricevuto dal client:', data);
    // Risposta al client
    socket.emit('rispostaSaluto', `Ciao, ${data.nome}!`);
}

const messaggio = async (socket, data) => {
    console.log('Messaggio ricevuto dal client:', data);
    // Risposta al client
    socket.emit('rispostaMessaggio', 'Messaggio ricevuto con successo!');
}

const richiestaTempo = async (socket) => {
    const oraCorrente = new Date().toLocaleTimeString();
    console.log('Richiesta di tempo ricevuta');
    // Risponde al client con l'ora corrente
    socket.emit('rispostaTempo', oraCorrente);
}



module.exports = 
                {
                    saluto,
                    messaggio
                };