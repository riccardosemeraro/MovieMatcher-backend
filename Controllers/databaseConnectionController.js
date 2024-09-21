const User = require('../Models/Users');
const HistoryMatch = require('../Models/HistoryMatch');
const { default: axios } = require('axios');

const verify = async (req, res) => {
    console.log("Verifica che l'utente sia in MongoDB");
    let user = req.body; //utente ricevuto da Auth0
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

                const utente = {
                    nickname: savedUser.Username,
                    sub: savedUser.Sub,
                    email: savedUser.Email,
                    name: savedUser.Nome,
                    surname: savedUser.Cognome
                };

                res.status(200).json({ message: 'User is saved in DB', user: utente });
            } catch (saveError) {
                console.error("Errore durante il salvataggio dell'utente:", saveError);
                res.status(500).json({ message: 'Error saving user', error: saveError });
            }
        }
        else{
            console.log("Utente già presente in MongoDB:", { userAlreadyExists });

            const utente = {
                nickname: userAlreadyExists.Username,
                sub: userAlreadyExists.Sub,
                email: userAlreadyExists.Email,
                name: userAlreadyExists.Nome,
                surname: userAlreadyExists.Cognome
            };

            res.status(200).json({ message: 'User is already in DB', user: utente });
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
                film = user.MyList.find((movie) => movie.id === movieId);
            } else if (list === 'vedere') {
                film = user.WatchList.find((movie) => movie.id === movieId);
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
    console.log("Aggiungi un film alla lista");
    
    const userSub = req.body.body.userSub;
    const movieId = req.body.body.movieId;
    const movieTitle = req.body.body.movieTitle;
    const moviePosterPath = req.body.body.moviePosterPath;
    const list = req.body.body.list;

    const token = req.headers.authorization;

    if (!token && !userSub && !movieId && !list && !movieTitle && !moviePosterPath) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findById(userSub);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            if(list === 'visti') {
                if ((user.MyList.find((movie) => movie.id === movieId)===undefined) && (user.WatchList.find((movie) => movie.id === movieId)===undefined)) { 
                    const movie = {
                        id: movieId,
                        title: movieTitle,
                        poster_path: moviePosterPath
                    };
                    console.log('Film da aggiungere:', { movie });
                    user.MyList.push(movie);
                    //si deve aggiornare anche il database
                    await User.Users.findByIdAndUpdate(userSub, { MyList: user.MyList });
                    res.status(200).json({ valueState: false, message: 'Film added to list', list: 'visti'});
                }
                else {
                    res.status(200).json({ valueState: true, message: 'Film already in list', list: 'visti'});
                }
            } else if (list === 'vedere') {
                if (user.MyList.find((movie) => movie.id === movieId)===undefined && user.WatchList.find((movie) => movie.id === movieId)===undefined) {
                    const movie = {
                        id: movieId,
                        title: movieTitle,
                        poster_path: moviePosterPath
                    };
                    user.WatchList.push(movie);
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
    console.log("Rimuovi un film dalla lista");
    
    const userSub = req.body.body.userSub;
    const movieId = req.body.body.movieId;
    const list = req.body.body.list;

    const token = req.headers.authorization;

    if (!token && !userSub && !movieId && !list ) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findById(userSub);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            if(list === 'visti') {
                if (user.MyList.find((movie) => movie.id === movieId)!==undefined) {
                    user.MyList = user.MyList.filter((movie) => movie.id !== movieId);
                    await User.Users.findByIdAndUpdate(userSub, { MyList: user.MyList });
                    res.status(200).json({ valueState: true, message: 'Film removed from list', list: 'visti'});
                }
            } else if (list === 'vedere') {
                if (user.WatchList.find((movie) => movie.id === movieId)!==undefined) {
                    user.WatchList = user.WatchList.filter((movie) => movie.id !== movieId);
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

const getMyList = async (req, res) => {
    console.log("Richiesta della mia lista visti");
    const userNickname = req.body.body.userNickname;
    const token = req.headers.authorization;

    if (!token && !userNickname) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findOne({ Username: userNickname });
        console.log('User:', user);

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            
            const movies = user.MyList;

            if(movies) res.status(200).json({ title: 'I tuoi Film Visti',  movies: movies });
            else res.status(404).json({title: 'I miei Film Visti', message: 'List not found' });

        }
    } catch (error) {
        console.error("Errore durante la richiesta della lista:", error);
        res.status(500).json({ message: 'Error getting list', error });
    }
};

const getWatchList = async (req, res) => {
    console.log("Richiesta della mia lista vedere");
    const userNickname = req.body.body.userNickname;
    const token = req.headers.authorization;

    if (!token && !userNickname) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findOne({ Username: userNickname });

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            
            const movies = user.WatchList;

            if(movies) res.status(200).json({ title: 'I tuoi Film da Vedere',  movies: movies });
            else res.status(404).json({title: 'I miei Film da Vedere', message: 'List not found' });

        }
    } catch (error) {
        console.error("Errore durante la richiesta della lista:", error);
        res.status(500).json({ message: 'Error getting list', error });
    }
};

const getUserData = async (req, res) => {
    console.log("Richiesta dei dati dell'utente");
    const userNickname = req.body.body.userNickname;
    const token = req.headers.authorization;

    if (!token && !userNickname) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const user = await User.Users.findOne({ Username: userNickname });

        if (user === null) {
            res.status(404).json({ message: 'User not found' });
        } else {
            const userData = {
                username: user.Username,
                email: user.Email,
                nome: user.Nome,
                cognome: user.Cognome
            };
            res.status(200).json({ userData: userData });
        }
    } catch (error) {
        console.error("Errore durante la richiesta dei dati dell'utente:", error);
        res.status(500).json({ message: 'Error getting user data', error });
    }
};

const updateUserData = async (req, res) => {

    console.log("Richiesta di aggiornamento dei dati dell'utente");

    const userSub = req.body.body.sub;
    const userNewNickname = req.body.body.nickname;
    const userNewNome = req.body.body.nome;
    const userNewCognome = req.body.body.cognome;

    const token = req.headers.authorization;

    if (!token && !userSub && !userNewNickname && !userNewNome && !userNewCognome) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {
        const userAlreadyExists = await User.Users.findOne({ Username: userNewNickname });

        if (userAlreadyExists === null || userAlreadyExists.Sub === userSub) {
            const user = await User.Users.findById(userSub);
            user.Username = userNewNickname;
            user.Nome = userNewNome;
            user.Cognome = userNewCognome;
            await User.Users.findByIdAndUpdate(userSub, { Username: userNewNickname, Nome: userNewNome, Cognome: userNewCognome });
            res.status(200).json({ message: 'User data updated', user: user });
        } else {
            res.status(201).json({ message: 'Username already exists' });
        }
    } catch (error) {
        console.error("Errore durante l'aggiornamento dei dati dell'utente:", error);
        res.status(500).json({ message: 'Error updating user data', error });
    }

};

const getMyHistoryMatch = async (req, res) => {

    console.log("Richiesta della mia lista di match");

    //axios.post('https://moviematcher-backend.onrender.com/user/getMyHistoryMatch', { headers: {Authorization: 'Bearer '+token, nickname: JSON.parse(localStorage.getItem('user')).nickname} })

    const nickname = req.headers.nickname;

    const token = req.headers.authorization;

    if (!token && !nickname) {
        res.status(401).json({ message: 'Params missing' });
    }

    try {

        let risposta = [];
        
        const user = await User.Users.findOne({ Username: nickname });

        const history = await HistoryMatch.HistoryMatch.find({});

        user.HistoryMatch.map((match) => {
            
            history.map((game) => {
                if (match === game.roomId && game.stato === 'Aperta') {
                    risposta.push(game);
                }
            });

            history.map((game) => {
                if (match === game.roomId && game.stato === 'In corso') {
                    risposta.push(game);
                }
            });

            history.map((game) => {
                if (match === game.roomId && game.stato === 'Terminata') {
                    risposta.push(game);
                }
            });

        });
        
        res.status(200).json({ historyMatch: risposta, message: "HistoryMatch dell'utente" });

    } catch (error) {
        console.error("", error);
        console.error("Errore durante la richiesta dei dati dell'utente:", error);
        res.status(500).json({ message: 'Error during user data request', error });
    }

};


module.exports =
                {
                    verify,
                    filmCheckList,
                    addFilm,
                    removeFilm,
                    getMyList,
                    getWatchList,
                    getUserData,
                    updateUserData,
                    getMyHistoryMatch
                };