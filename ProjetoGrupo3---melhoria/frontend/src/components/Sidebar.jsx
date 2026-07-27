import { useState } from "react";
import { createPortal } from "react-dom";
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

  const [showModal, setShowModal] = useState(false);

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

          <div className="user-actions">
            <Link to="/Opcoes" className="btn-icon" title="Opções">
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>

            <button
              className="btn-icon btn-sair" 
              onClick={() => setShowModal(true)}
              title="Sair"
            >
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
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT — renderizado via Portal direto no body */}
      {showModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
              <h3>Sair da conta</h3>
              <p>Tem certeza que deseja sair?</p>
              <div className="modal-actions">
                <button
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn-confirmar-saida" onClick={handleSair}>
                  Sair
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}