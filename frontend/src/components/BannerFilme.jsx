const BACKDROP = "https://image.tmdb.org/t/p/original";

function BannerFilme({ backdrop }) {

    return (

        <div
            className="banner-filme"
            style={{
                backgroundImage: `url(${BACKDROP}${backdrop})`
            }}
        />

    );

}

export default BannerFilme;