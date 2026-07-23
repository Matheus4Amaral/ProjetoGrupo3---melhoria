// Importa funções do React:
// - createContext: cria o "canal" compartilhado entre componentes
// - useContext: permite "ouvir" esse canal de dentro de qualquer componente
// - useState: guarda a lista de toasts ativos (dado que muda com o tempo)
// - useCallback: evita recriar a função mostrarToast a cada re-render
import {createContext, useContext, useState, useCallback} from "react";
// createPortal permite renderizar um elemento fora da árvore normal do DOM
// (nesse caso, direto dentro do <body>), evitando problemas de z-index
import {createPortal} from "react-dom";
import styles from "./Toast.module.css"

const ToastContext = createContext(null);

let proximoId = 1

// ToastProvider é o componente que vai "envolver" a aplicação inteira.
// Tudo que for renderizado dentro dele (via {children}) ganha acesso à função mostrarToast através do Context.

export function ToastProvider({children}) {

    const [toasts, setToasts] = useState([]);

    // useCallback(fn, []) faz o React "lembrar" dessa função e não recriar ela do zero a cada vez que o ToastProvider re-renderiza — isso evita  que componentes que dependem dela re-renderizem à toa.

    const mostrarToast = useCallback((mensagem, tipo="sucesso") => {

        const id = proximoId++;

        setToasts((atual) => [...atual,{id,mensagem, tipo}]);

        // Programa a remoção AUTOMÁTICA desse toast específico depois de 2.5s.
        // Isso dá o efeito de "aparece e some sozinho".
        setTimeout(() => {
            setToasts((atual) => atual.filter((toast) => toast.id !== id));
        }, 2500)

    }, []);

    return (
        <>
        <ToastContext.Provider value={mostrarToast}>
            {/* children = tudo que foi colocado dentro de <ToastProvider>...</ToastProvider>
            no App.jsx ( as <Routes> com todas as páginas).
            Isso continua sendo renderizado normalmente. */}
            {children}

            {createPortal (
                <div className={styles.toastContainer}>
                    {toasts.map((toast) => (
                        <div 
                            key={toast.id}
                            className={`${styles.toast} ${styles[toast.tipo]} `}
                        >
                            {toast.mensagem}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
        </>
    )
}

export function useToast() {
    return useContext(ToastContext);
}