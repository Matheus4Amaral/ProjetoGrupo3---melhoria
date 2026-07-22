function InformacoesFilme({ filme }) {
  return (
    <div className="informacoes-filme">
      <h1>{filme.title}</h1>

      <div className="dados-filme">
        <span>⭐ {filme.vote_average ? filme.vote_average.toFixed(1) : "N/A"}</span>

        {filme.release_date && (
          <span>
            📅 {(() => {
              const [ano, mes, dia] = filme.release_date.split("-");
              return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
            })()}
          </span>
        )}

        {filme.runtime ? (
          <span>⏱ {filme.runtime} min</span>
        ) : (
          filme.number_of_seasons && (
            <span>📺 {filme.number_of_seasons} temporada{filme.number_of_seasons > 1 ? "s" : ""}</span>
          )
        )}
      </div>

      <div className="generos">
        {filme.genres.map((genero) => (
          <span key={genero.id} className="genero">
            {genero.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default InformacoesFilme;