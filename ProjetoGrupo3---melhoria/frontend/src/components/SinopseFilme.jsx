function SinopseFilme({ overview }) {

    return (

        <section className="sinopse-filme">

            <h2>Sinopse</h2>

            <p>

                {overview || "Sinopse indisponível."}

            </p>

        </section>

    );

}

export default SinopseFilme;