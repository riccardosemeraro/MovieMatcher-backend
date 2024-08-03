const mongoose = require('mongoose');
const usersSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Username: {
        type: String,
        required: true,
    },
    MyList: {
        type: Array,
        required: false,
    },
    WatchList: {
        type: Array,
        required: false,
    },
    ListGenres: {
        type: Array,
        required: false,
    },
    Cognome: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true
    },
    Nome: {
        type: String,
        required: true
    },
    Sub: {
        type: String,
        required: true
    }
});

exports.Users = mongoose.model('Users', usersSchema);