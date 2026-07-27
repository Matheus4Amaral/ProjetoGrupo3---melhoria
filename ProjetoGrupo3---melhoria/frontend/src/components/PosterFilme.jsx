const POSTER = "https://image.tmdb.org/t/p/w500";

function PosterFilme({ poster, titulo }) {

    return (

        <img
            className="poster-filme"
            src={`${POSTER}${poster}`}
            alt={titulo}
        />

    );

}

export default PosterFilme;