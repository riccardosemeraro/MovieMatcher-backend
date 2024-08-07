const { application } = require('express');
const User = require('../Models/Users');

const verify = async (req, res) => {
    console.log("Verifica che l'utente sia in MongoDB");
    let user = req.body;
    const token = req.headers.authorization;

    if (!user) {
        return res.status(400).json({ message: 'User is required' });
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
        return res.status(401).json({ message: 'Invalid user' });
    }

};

//const ktm = ...;

module.exports = {verify}; //ktm, ...