import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import iconeInicio from "../assets/icons/icone_inicio.svg";
import iconeCatalogo from "../assets/icons/icone_catalogo.svg";
import iconeMinhaLista from "../assets/icons/icone_minha_lista.svg";
import iconeAssistidos from "../assets/icons/icone_assistidos.svg";
import Icon from "../assets/flashview_simbolo.svg";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem("usuarioNome") || "Usuário";

  const iniciais = usuarioNome
    .split(" ")
    .map((palavra) => palavra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleSair() {
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    navigate("/");
  }

  return (
    <aside className="sidebar">
      {/* Bloco Superior (Logo, Busca e Menu) */}
      <div className="sidebar-top">
        {/* LOGO */}
        <div className="sidebar-logo">
          <img src={Icon} alt="FlashView Logo" className="sidebar-logo-icon" />
          <h2>
            Flash<span>View</span>
          </h2>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="sidebar-nav">
          <Link
            to="/Inicio"
            className={`nav-item ${location.pathname === "/Inicio" ? "active" : ""}`}
          >
            <img src={iconeInicio} alt="Ícone Início" className="menu-icon" />
            Inicio
          </Link>

          <Link
            to="/Catalogo"
            className={`nav-item ${location.pathname === "/Catalogo" ? "active" : ""}`}
          >
            <img
              src={iconeCatalogo}
              alt="Ícone Catálogo"
              className="menu-icon"
            />
            Catálogo
          </Link>

          <Link
            to="/MinhaLista"
            className={`nav-item ${location.pathname === "/MinhaLista" ? "active" : ""}`}
          >
            <img
              src={iconeMinhaLista}
              alt="Ícone Minha Lista"
              className="menu-icon"
            />
            Minha Lista
          </Link>

          <Link
            to="/assistidos"
            className={`nav-item ${location.pathname === "/assistidos" ? "active" : ""}`}
          >
            <img
              src={iconeAssistidos}
              alt="Ícone Assistidos"
              className="menu-icon"
            />
            Assistidos
          </Link>
        </nav>
      </div>

      {/* PERFIL DO USUÁRIO */}
      <div className="sidebar-bottom">
        <div className="user-profile">
          <div className="user-avatar">{iniciais}</div>
          <span className="user-name">{usuarioNome}</span>

          <button className="btn-sair" onClick={handleSair} title="Sair">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
