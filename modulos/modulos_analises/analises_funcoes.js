/**
 * modulos/modulos_analises/analises_funcoes.js
 * Funções utilitárias e suporte visual otimizadas
 */

/**
 * Remove espaços extras de strings
 */
export function limparEspacos(texto) {
    return texto ? texto.trim() : texto;
}

/**
 * Gerencia o sistema de cópia com feedback visual (Toast)
 */
export async function copiarLink(url) {
    try {
        await navigator.clipboard.writeText(url);
        const toast = document.getElementById('toast-copiado');
        if (toast) {
            toast.classList.add('mostrar');
            setTimeout(() => toast.classList.remove('mostrar'), 2500);
        }
    } catch (err) {
        console.error("Erro ao copiar link:", err);
    }
}

/**
 * Aciona o compartilhamento nativo ou fallback para cópia
 */
export function compartilharNoticia(titulo, url) {
    const shareData = { title: titulo, url: url };
    if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
            if (err.name !== 'AbortError') console.error(err);
        });
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC de um iframe de vídeo de forma dinâmica
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (!player || !idVideo) return;

    const params = "?autoplay=1&mute=0&modestbranding=1&rel=0";
    
    // Formata o ID do vídeo para o padrão embed do YouTube caso não seja uma URL completa
    let novoSrc = idVideo;
    if (!idVideo.includes('http')) {
        novoSrc = `http://googleusercontent.com/youtube.com/${idVideo}`;
    }
    
    // Adiciona os parâmetros de autoplay e interface
    player.src = novoSrc.includes('?') ? `${novoSrc}&autoplay=1` : novoSrc + params;
}

/**
 * Gerencia o fechamento do modal e limpa a URL (ID da notícia)
 */
export function fecharModalPrincipal() {
    // Tenta usar a função global se existir, senão usa a lógica local
    if (window.fecharModal) {
        window.fecharModal();
    } else {
        const modal = document.getElementById('modal-noticia');
        if (modal) modal.style.display = 'none';
    }
    
    // Remove o parâmetro 'id' da URL sem recarregar a página
    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url.pathname + url.search);
    }
}
