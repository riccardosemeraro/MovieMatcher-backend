const axios = require('axios');

const options = { method: 'GET', headers: { accept: 'application/json', Authorization: 'Bearer ' + process.env.TMDB_API_KEY} };

const movieSlider = async (req, res) => {

    console.log("Richiesta di film a TMDB per lo slider");

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
        const userNickname = req.query.userNickname;
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

        //da /tmdb devo andare a /user per prelevare la lista dei film MyList dell'utente con nickname e poi fare richesta a TMDB per i film raccomandati per ogni id della lista MyList

        res.status(200).json({ movies });
    }


};

const filmPage = async (req, res) => {
    console.log("Richiesta di dettagli di un film a TMDB");

    const id = req.params.id;

    let italianDate = "";

    axios.get('https://api.themoviedb.org/3/movie/' + id + '?language=it-IT', options)
        .then((response) => {
            console.log("Dettagli del film ricevuti da TMDB");

            axios.get('https://api.themoviedb.org/3/movie/' + id + '/release_dates', options)
                .then((response2) => {
                    console.log("Date di uscita dello stesso film ricevute da TMDB");

                    if(response2.data.results.length > 0) {
                        italianDate = response2.data.results.find(release => release.iso_3166_1 === 'IT');
                        if (italianDate && italianDate.release_dates.length > 0) {
                            italianDate = italianDate.release_dates[0].release_date.slice(0, 10); // Prendi solo la parte della data
                            italianDate = italianDate.split('-').reverse().join('/'); // Formatta la data in gg/mm/aaaa
                            console.log('Data di uscita in Italia:', italianDate);
                        }
                    }

                    const movie = {
                        backdrop_path: response.data.backdrop_path,
                        poster_path: response.data.poster_path,
                        title: response.data.title,
                        genres: response.data.genres,
                        release_date: italianDate || response.data.release_date,
                        vote: Math.floor(response.data.vote_average * 100)/100,
                        overview: response.data.overview
                    };

                    //invio al client i dettagli del film
                    if(movie) res.status(200).json({ id: id,  movie: movie });
                    else res.status(404).json({id: id, message: 'Movie not found' });
                })
                .catch((error) => {
                    console.log("Errore durante la richiesta di date di uscita dello stesso film a TMDB", error);
                    res.status(500).json({ message: 'Error requesting movie release dates to TMDB', error: error });
                });
        })
        .catch((error) => {
            console.log("Errore durante la richiesta di dettagli di un film a TMDB", error);
            res.status(500).json({ message: 'Error requesting movie details to TMDB', error: error });
        });
    
}

const search = async (req, res) => {
    console.log("Richiesta di ricerca di film a TMDB");

    const query = req.query.query;

    axios.get('https://api.themoviedb.org/3/search/movie?query='+query+'&include_adult=false&language=it-IT&page=1', options)
        .then((response) => {
            console.log("Film ricevuti da TMDB");

            const movies = response.data.results.map((movie) => {
                return {
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date
                };
            });

            // voglio inviare al client il vettore movies
            if (movies.length > 0) res.status(200).json({ movies: movies });
            else res.status(404).json({ message: 'Movies not found' });
        })
        .catch( (error) => {
            console.log("Errore durante la ricerca di film a TMDB", error);
            res.status(500).json({ message: 'Error searching movies to TMDB', error: error });
        });
}



module.exports = {
                    movieSlider,
                    filmPage,
                    search
                };
