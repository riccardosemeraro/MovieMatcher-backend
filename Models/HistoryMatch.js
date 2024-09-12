const e = require('cors');
const mongoose = require('mongoose');

const historyMatchSchema = mongoose.Schema({
    /*_id: {
        type: String,
        required: true,
    },*/
    roomId: {
        type: String,
        required: true,
    },
    roomName: {
        type: String,
        required: true,
    },
    creatore: {
        type: String,
        required: true,
    },
    listaPartecipanti:  [
                        {
                            username: {
                                type: String,
                                required: false,
                            },
                            stato: {
                                type: String,
                                enum: ['Entrato', 'Pronto', 'Votato', 'Uscito'],
                                default: 'Entrato',
                                required: false
                            },
                            listaFilm:  [
                                        {
                                            id: {
                                                type: String,
                                                required: false,
                                            },
                                            title: {
                                                type: String,
                                                required: false,
                                            },
                                            poster_path: {
                                                type: String,
                                                required: false,
                                            }
                                        }
                                        ]
                        }
                        ],
    listaFilm:  [
                {
                    film: {
                            id: {
                                type: String,
                                required: false,
                            },
                            title: {
                                type: String,
                                required: false,
                            },
                            poster_path: {
                                type: String,
                                required: false,
                            }

                    },
                    punteggi: {
                        type: Array,
                        required: false,
                    },
                }
                ],
    impostazioni: {
        type: String,
        required: false
    },
    stato: {
        type: String,
        enum: ['Aperta', 'In corso', 'Terminata'],
        default: 'Aperta',
        required: false
    },
    dataCreazione: {
        type: Date,
        required: true
    },
    classifica: [
                {
                    film: {
                        id: {
                            type: String,
                            required: false,
                        },
                        title: {
                            type: String,
                            required: false,
                        },
                        poster_path: {
                            type: String,
                            required: false,
                        }

                    },
                    punteggio: {
                        type: Number,
                        required: false,
                    }
                }
                ]
});

exports.HistoryMatch = mongoose.model('HistoryMatch', historyMatchSchema); //Esporta il modello HistoryMatch per poterlo utilizzare in altri file