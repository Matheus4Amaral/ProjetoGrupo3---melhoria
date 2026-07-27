function getChaveStorage() {
  const usuarioId = localStorage.getItem("usuarioId");
  return usuarioId ? `minhaLista_${usuarioId}` : "minhaLista_convidado";
}

export function obterLista() {
  return JSON.parse(localStorage.getItem(getChaveStorage())) || [];
}

export function estaNaLista(id) {
  const lista = obterLista();
  return lista.some((filme) => filme.id === id);
}

export function adicionarNaLista(filmeData) {
  const lista = obterLista();
  const filmeExiste = lista.some((filme) => filme.id === filmeData.id);

  if (filmeExiste) {

    if(filmeData.tipo === "movie"){
      return {
        sucesso: false,
        mensagem: "Esse filme já está na sua lista!",
      };
    } else {
      return {
        sucesso: false,
        mensagem: "Essa série já está na sua lista!",
      };
    }
    
  } 

  lista.push(filmeData);
  localStorage.setItem(getChaveStorage(), JSON.stringify(lista));

  if(filmeData.tipo === "movie"){
    return {
      sucesso: true,
      mensagem: "Filme adicionado!",
    };
  } else {
    return {
      sucesso: true,
      mensagem: "Série adicionada!",
    };
  }
  
}

export function removerDaLista(id) {
  const lista = obterLista();
  const novaLista = lista.filter((filme) => filme.id !== id);
  localStorage.setItem(getChaveStorage(), JSON.stringify(novaLista));

  return {
    sucesso: true,
    mensagem: "Filme removido da lista.",
  };
}