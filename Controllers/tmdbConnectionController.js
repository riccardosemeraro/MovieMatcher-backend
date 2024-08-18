const axios = require('axios');

const movieSlider = async (req, res) => {

    console.log("Richiesta di film a TMDB per lo slider");

    const options = { method: 'GET', headers: { accept: 'application/json', Authorization: 'Bearer ' + process.env.TMDB_API_KEY} };

    const type = req.query.type;
    let url = '';
    let movies = [];
    let titolo = '';

    url = 'https://api.themoviedb.org/3/movie/'+ type +'?language=it-IT&page=1';
    if (type === 'popular') {
        console.log("Richiesta di film popolari");
        titolo = 'Film popolari';
    } 
    else if (type === 'top_rated') {
        console.log("Richiesta di film top rated");
        titolo = 'Film più votati';
    }else if (type === 'now_playing') {
        console.log("Richiesta di film now playing");
        titolo = 'Film della settimana';
    }else if (type === 'similar') {
        console.log("Richiesta di film simili");
        const idFilm = req.query.id;
        url = 'https://api.themoviedb.org/3/movie/'+ idFilm +'/recommendations?language=it-IT&page=1';
        titolo = 'Film simili';
    } else if (type === 'raccomandations') {
        console.log("Richiesta di raccomandazioni");
        const idUser = req.query.idUser;
        //const movies = ... dopo esecuzione di script di raccomandazione ritorna un vettore di film "sporchi"
        titolo = "Consigliati per te";
    }
    else {
        console.log("Tipo di richiesta non riconosciuto: Richiesta di film now playing di default");
        url = 'https://api.themoviedb.org/3/movie/now_playing?language=it-IT&page=1';
        titolo = 'Film della settimana';
    }

    if ( type !== 'raccomandations') {
        axios.get(url, options)
            .then((response) => {
                console.log("Film ricevuti da TMDB");
                
                movies = response.data.results.map((movie) => {
                    return {
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path
                    };
                });

                //console.log("Film da inviare al client:", { movies });

                // voglio inviare al client il vettore movies
                if (movies.length > 0) res.status(200).json({ title: titolo, movies: movies });
                else res.status(404).json({ title: titolo , message: 'Movies not found' });
            })
            .catch( (error) => {
                console.log("Errore durante la richiesta di film a TMDB", error);
                res.status(500).json({title:titolo, message: 'Error requesting movies to TMDB', error: error });
            });
    } else {
        //gestione risposta script di raccomandazione

        res.status(200).json({ movies });
    }


};

const filmPage = async (req, res) => {
    console.log("Richiesta di dettagli di un film a TMDB");

}

module.exports = {movieSlider,
                  filmPage
                };
