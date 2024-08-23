const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    Username: {
        type: String,
        required: true,
    },
    MyList: [
            {
                id: {
                    type: String,
                    required: false
                },
                title: {
                    type: String,
                    required: false
                },
                poster_path: {
                    type: String,
                    required: false
                }
            },
    ],
    WatchList:  [
                {
                    id: {
                        type: String,
                        required: false
                    },
                    title: {
                        type: String,
                        required: false
                    },
                    poster_path: {
                        type: String,
                        required: false
                    }
                },
    ],
    ListGenres: {
        type: Array,
        required: false,
    },
    HistoryMatch: {
        type: Array,
        required: false,
    },
    Cognome: {
        type: String,
        required: false,
    },
    Email: {
        type: String,
        required: true
    },
    Nome: {
        type: String,
        required: false
    },
    Sub: {
        type: String,
        required: true
    }
});

exports.Users = mongoose.model('Users', usersSchema);