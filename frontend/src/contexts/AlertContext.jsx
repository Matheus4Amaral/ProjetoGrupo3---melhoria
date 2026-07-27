import { createContext, useContext, useState, useCallback } from "react";
import CustomAlert from "../components/CustomAlert.jsx";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerta, setAlerta] = useState({
    aberto: false,
    titulo: "",
    mensagem: "",
    textoConfirmar: "OK",
    textoCancelar: "Cancelar",
    mostrarCancelar: false,
    onConfirmar: null,
  });

  const fecharAlerta = useCallback(() => {
    setAlerta((prev) => ({
      ...prev,
      aberto: false,
    }));
  }, []);

  const mostrarAlerta = useCallback(
    ({
      titulo,
      mensagem,
      textoConfirmar = "OK",
      textoCancelar = "Cancelar",
      mostrarCancelar = false,
      onConfirmar = null,
    }) => {
      setAlerta({
        aberto: true,
        titulo,
        mensagem,
        textoConfirmar,
        textoCancelar,
        mostrarCancelar,
        onConfirmar,
      });
    },
    [],
  );

  function handleConfirmar() {
    if (alerta.onConfirmar) {
      alerta.onConfirmar();
    }
    fecharAlerta();
  }

  return (
    <AlertContext.Provider value={{ mostrarAlerta, fecharAlerta }}>
      {children}

      <CustomAlert
        aberto={alerta.aberto}
        titulo={alerta.titulo}
        mensagem={alerta.mensagem}
        textoConfirmar={alerta.textoConfirmar}
        textoCancelar={alerta.textoCancelar}
        mostrarCancelar={alerta.mostrarCancelar}
        onFechar={fecharAlerta}
        onConfirmar={handleConfirmar}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert deve ser usado dentro de AlertProvider");
  }

  return context;
}