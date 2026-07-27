import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import styles from './NotFound.module.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageRoot}>
      <main className={styles.notFoundContent}>
        <div className={styles.messageContainer}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.errorTitle}>Página não encontrada</h2>
          <p className={styles.errorText}>
            Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
          </p>
          <button className={styles.backButton} onClick={() => navigate('/Inicio')}>
            Voltar para o Início
          </button>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
