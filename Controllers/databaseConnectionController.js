const { application } = require('express');
const User = require('../Models/Users');
const { use } = require('moongose/routes');
const e = require('express');

const verify = async (req, res) => {
    console.log("Verifica che l'utente sia in MongoDB");
    let user = req.body;
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ message: 'Token is required' });
    }

    if (!user) {
        res.status(400).json({ message: 'User is required' });
    }

    try {
        //simulazione script di verifica che l'utente sia in MongoDB

        //da stringa a oggetto javascript
        user = JSON.parse(user.body);
        
        //console.log('Utente: ' + user.sub);

        //const userAlreadyExists = await User.Users.findOne({ Sub: user.sub });
        const userAlreadyExists = await User.Users.findById(user.sub);

        console.log('Utente in MongoDB:', { userAlreadyExists });

        if (userAlreadyExists === null) {
            const newUser = new User.Users({
                _id: user.sub,
                Username: user.nickname,
                MyList: [],
                WatchList: [],
                ListGenres: [],
                HistoryMatch: [],
                Cognome: user.family_name || '',
                Email: user.email,
                Nome: user.given_name || '',
                Sub: user.sub
            });

            console.log('Nuovo utente:', { newUser });
            
            try {
                const savedUser = await newUser.save();
                console.log("Utente salvato in MongoDB:", { savedUser });
                res.status(200).json({ message: 'User is saved in DB', user });
            } catch (saveError) {
                console.error("Errore durante il salvataggio dell'utente:", saveError);
                res.status(500).json({ message: 'Error saving user', error: saveError });
            }
        }
        else{
            console.log("Utente già presente in MongoDB:", { userAlreadyExists });
            res.status(200).json({ message: 'User is already in DB', user });
        }
    } catch (error) {
        console.error("Errore durante la verifica dell'utente:", error);
        res.status(401).json({ message: 'Invalid user' });
    }

};

const filmCheckList = async (req, res) => {
    console.log("Verifica che un film sia in lista");
    const userSub = req.body.body.userSub;
    const movieId = req.body.body.movieId;
    const list = req.body.body.list;
    const token = req.headers.authorization;

    if (!token && !userSub && !movieId && !list) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        //simulazione script di verifica che il film sia in lista

        const user = await User.Users.findById(userSub);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            let film = undefined;
            if (list === 'visti') {
                film = user.MyList.find((movie) => movie === movieId);
            } else if (list === 'vedere') {
                film = user.WatchList.find((movie) => movie === movieId);
            }

            if (film === undefined) {
                res.status(200).json({ value: true, message: 'Film not found in list' });
            }
            else {
                res.status(200).json({ value: false, message: 'Film found in list'});
            }
        }
    } catch (error) {
        console.error("Errore durante la verifica del film:", error);
        res.status(500).json({ message: 'Error checking film', error });
    }
};

const addFilm = async (req, res) => {
    console.log("Aggiungi o rimuovi un film dalla lista");
    
    const userSub = req.body.body.userSub;
    const movieId = req.body.body.movieId;
    const list = req.body.body.list;

    const token = req.headers.authorization;

    if (!token && !userSub && !movieId && !list && !insert) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findById(userSub);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            if(list === 'visti') {
                if (!user.WatchList.includes(movieId) && !user.MyList.includes(movieId)) {
                    user.MyList.push(movieId);
                    //si deve aggiornare anche il database
                    await User.Users.findByIdAndUpdate(userSub, { MyList: user.MyList });
                    res.status(200).json({ valueState: false, message: 'Film added to list', list: 'visti'});
                }
                else {
                    res.status(200).json({ valueState: true, message: 'Film already in list', list: 'visti'});
                }
            } else if (list === 'vedere') {
                if (!user.WatchList.includes(movieId) && !user.MyList.includes(movieId)) {
                    user.WatchList.push(movieId);
                    await User.Users.findByIdAndUpdate(userSub, { WatchList: user.WatchList });
                    res.status(200).json({ valueState: false, message: 'Film added to list', list: 'vedere'});
                }
                else {
                    res.status(200).json({ valueState: true, message: 'Film already in list', list: 'vedere'});
                }
            }
        }

    } catch (error) {
        console.error("Errore durante l'aggiunta o rimozione del film:", error);
        res.status(500).json({ message: 'Error adding or removing film', error });
    }
};

const removeFilm = async (req, res) => {
    console.log("Aggiungi o rimuovi un film dalla lista");
    
    const userSub = req.body.body.userSub;
    const movieId = req.body.body.movieId;
    const list = req.body.body.list;

    const token = req.headers.authorization;

    if (!token && !userSub && !movieId && !list && !insert) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findById(userSub);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            if(list === 'visti') {
                if (user.MyList.includes(movieId)) {
                    user.MyList = user.MyList.filter((movie) => movie !== movieId);
                    await User.Users.findByIdAndUpdate(userSub, { MyList: user.MyList });
                    res.status(200).json({ valueState: true, message: 'Film removed from list', list: 'visti'});
                }
            } else if (list === 'vedere') {
                if (user.WatchList.includes(movieId)) {
                    user.WatchList = user.WatchList.filter((movie) => movie !== movieId);
                    await User.Users.findByIdAndUpdate(userSub, { WatchList: user.WatchList });
                    res.status(200).json({ valueState: true, message: 'Film removed from list', list: 'vedere'});
                }
            }
        }

    } catch (error) {
        console.error("Errore durante l'aggiunta o rimozione del film:", error);
        res.status(500).json({ message: 'Error adding or removing film', error });
    }
};


module.exports =
                {
                    verify,
                    filmCheckList,
                    addFilm,
                    removeFilm
                };