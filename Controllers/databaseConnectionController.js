const verify = async (req, res) => {
    console.log("Verifica che l'utente sia in MongoDB");
    const user = req.body;
    const token = req.headers.authorization;

    console.log('Dati ricevuti:', { user });
    console.log('Token:', { token });

    if (!user) {
        return res.status(400).json({ message: 'User is required' });
    }

    try {
        //simulazione script di verifica token

        return res.status(200).json({ message: 'User is authenticated', user });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

};

//const ktm = ...;

module.exports = {verify}; //ktm, ...