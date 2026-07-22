import {useState, useEffect} from "react";
import Sidebar from "../../components/Sidebar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import styles from "./Catalogo.module.css";

import iconeLupa from "../../assets/icons/lupa.svg";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

function Catalogo () {

    const [tipoConteudo, setTipoConteudo] = useState("movie"); // "movie" ou "tv"
    const [itens, setItens] = useState([]);
    const [generos, setGeneros] = useState([]);
    const [generoSelecionado, setGeneroSelecionado] = useState("todos");
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    // busca a lista de gêneros sempre que o tipo (filme/série) muda,
    // já que os IDs de gênero de filme e série são diferentes no TMDB
    useEffect(() => {
        async function fetchGeneros() {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/genre/${tipoConteudo}/list?api_key=${API_KEY}&language=pt-BR`
                );
                const data = await response.json();
                setGeneros(data.genres || []);
            } catch (err) {
                console.error("Erro ao buscar gêneros : ", err);
            }
        }
        setGeneroSelecionado("todos"); // reseta o filtro ao trocar de tipo
        fetchGeneros();
    }, [tipoConteudo]); // fechar useEffect

      // busca os itens sempre que a busca, o gênero ou o tipo mudam
      useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchItens();
        }, 400); // espera 400ms após parar de digitar, evita chamadas excessivas à API
        return () => clearTimeout(timeoutId);
      }, [busca, generoSelecionado, tipoConteudo]) //fechar useEffect

      async function fetchItens() {
        try {

            setCarregando(true);
            setErro(null);

            let url;

            if (busca.trim() !== "") {
                // busca por texto usa o endpoint de pesquisa.
                url = `https://api.themoviedb.org/3/search/${tipoConteudo}?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(busca)}`;
            } else if (generoSelecionado !== "todos") {
                 // filtro por gênero usa o endpoint de descoberta
                 url = `https://api.themoviedb.org/3/discover/${tipoConteudo}?api_key=${API_KEY}&language=pt-BR&with_genres=${generoSelecionado}`;
            } else {
                // sem busca nem filtro: lista os populares
                 url = `https://api.themoviedb.org/3/${tipoConteudo}/popular?api_key=${API_KEY}&language=pt-BR`;
             } 

             const response = await fetch(url);

             if (!response.ok) {
                throw new Error ("Não foi possível carregar o catálogo");
             }

             const data = await response.json();

             // normaliza os campos, já que filme usa title/release_date
             // e série usa name/first_air_date
             const itensNormalizados = (data.results || []).map((item) => ({
                id: item.id,
                titulo: tipoConteudo === "tv" ? item.name : item.title,
                dataLancamento: tipoConteudo === "tv" ? item.first_air_date : item.release_date,
                poster_path: item.poster_path,
                genre_ids: item.genre_ids,
             }));

             setItens(itensNormalizados);
        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
       }
    return (
        <>
            <div className={styles.pageRoot}>
                <Sidebar />
                <main className={styles.catalogoContent}>
                    <header className={styles.catalogoHeader}>
                        <h1>Catálogo</h1>
                         <p>Explore filmes e séries para descobrir sua próxima escolha</p>
                    </header>

                    <div className={styles.tipoToggle}>
                        <span
                            className={`${styles.categoryPill} ${tipoConteudo === "movie" ? styles.active : ""}`}
                            onClick={() => setTipoConteudo("movie")}
                        >
                            Filmes
                        </span>
                        <span
                            className={`${styles.categoryPill} ${tipoConteudo === "tv" ? styles.active : ""}`}
                            onClick={() => setTipoConteudo("tv")}
                        >
                            Séries
                        </span>
                    </div>
                    
                    <div className={styles.filtrosBar}>
                        <div className={styles.searchBar}>
                            <img src={iconeLupa} alt="Pesquisar" style={{ width: "18px", height: "18px" }}></img>
                            <input 
                                type="text"
                                placeholder={tipoConteudo === "tv" ? "Pesquisar séries..." : "Pesquisar filmes..."}
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />            
                        </div>
                    </div>

                     <div className={styles.categoriesList}>
                        <span
                            className={`${styles.categoryPill} ${generoSelecionado === "todos" ? styles.active : ""}`}
                            onClick={() => setGeneroSelecionado("todos")}
                        >
                            Todos
                        </span>
                        {generos.map((genero) => (
                            <span
                                key = {genero.id}
                                 className={`${styles.categoryPill} ${generoSelecionado === String(genero.id) ? styles.active : ""}`}
                                 onClick={() => setGeneroSelecionado(String(genero.id))}
                            >
                                {genero.name}
                            </span>
                        ))}
                        </div>

                        {carregando && <p className={styles.statusMsg}>Carregando...</p>}
                        {erro && <p className={styles.statusMsg}>Erro : {erro}</p>}

                          {!carregando && !erro && (

                            <div className={styles.moviesGrid}>
                                    {itens.map((item) => (
                                 <MovieCard
                                    key={item.id}
                                    id={item.id}
                                    titulo={item.titulo}
                                    subtitulo={item.dataLancamento ? item.dataLancamento.slice(0, 4) : ""}
                                    poster={item.poster_path ? `${IMG_BASE}${item.poster_path}` : null}
                                    genre_ids={item.genre_ids}
                                    mostrarBotaoAdd={true}
                                    tipo={tipoConteudo}
                                />
                                ))}
                            </div>
                            )}  

                                {!carregando && !erro && itens.length === 0 && (
                                    <p className={styles.statusMsg}>
                                         Nenhum resultado encontrado.
                                    </p>
                                )}
                                
                    <footer className={styles.tmdbAttribution}>
                    <p>Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.</p>
                    </footer>
                </main>
            </div>

        </>
    )
}

export default Catalogo;