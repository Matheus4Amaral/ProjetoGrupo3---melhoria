import { useEffect, useState } from "react";
import "./TemporadasSerie.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const STILL_BASE = "https://image.tmdb.org/t/p/w300";

function TemporadasSerie({ serieId, temporadas }) {
  // filtra as temporadas válidas (remove a "0", que é Especiais/Bastidores)
  // logo no início, pra já usar essa lista tanto no state inicial
  // quanto na renderização das abas
  const temporadasValidas = (temporadas || []).filter((t) => t.season_number > 0);

  // agora o valor inicial pega a primeira temporada REAL (normalmente a 1),
  // e não mais a primeira do array bruto (que podia ser a "0")
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(
    temporadasValidas[0]?.season_number ?? 1
  );

  const [episodios, setEpisodios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!serieId || temporadaSelecionada == null) return;

    async function carregarEpisodios() {
      try {
        setCarregando(true);
        setErro(null);

        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${serieId}/season/${temporadaSelecionada}?api_key=${API_KEY}&language=pt-BR`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar episódios.");
        }

        const data = await response.json();
        setEpisodios(data.episodes || []);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarEpisodios();
  }, [serieId, temporadaSelecionada]);

  return (
    <section className="temporadas-serie">
      <h2>Temporadas</h2>

      <div className="temporadas-tabs">
        {temporadasValidas.map((t) => (
          <button
            key={t.season_number}
            className={`temporada-tab ${
              t.season_number === temporadaSelecionada ? "ativa" : ""
            }`}
            onClick={() => setTemporadaSelecionada(t.season_number)}
          >
            Temporada {t.season_number}
          </button>
        ))}
      </div>

      {carregando && <p>Carregando episódios...</p>}
      {erro && <p>{erro}</p>}

      {!carregando && !erro && (
        <div className="episodios-lista">
          {episodios.map((ep) => (
            <div key={ep.id} className="episodio-card">
              {ep.still_path ? (
                <img
                  src={`${STILL_BASE}${ep.still_path}`}
                  alt={ep.name}
                  className="episodio-still"
                />
              ) : (
                <div className="episodio-still episodio-still-indisponivel">
                  <span>Poster indisponível</span>
                </div>
              )}
              <div className="episodio-info">
                <h3>
                  {ep.episode_number}. {ep.name}
                </h3>
                {ep.air_date && <span className="episodio-data">{ep.air_date}</span>}
                <p className="episodio-overview">
                  {ep.overview || "Sinopse indisponível."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TemporadasSerie;