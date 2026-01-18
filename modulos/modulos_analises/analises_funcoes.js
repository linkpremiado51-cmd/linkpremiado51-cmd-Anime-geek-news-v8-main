/**
 * modulos/modulos_analises/analises_funcoes.js
 * Funções utilitárias e de suporte
 */

/**
 * Remove espaços extras de strings (útil para URLs de vídeos e imagens)
 */
export function limparEspacos(texto) {
    return texto ? texto.trim() : texto;
}

/**
 * Gerencia o sistema de cópia para área de transferência com feedback visual (Toast)
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
 * Aciona o compartilhamento nativo do dispositivo ou faz o fallback para cópia
 */
export function compartilharNoticia(titulo, url) {
    if (navigator.share) {
        navigator.share({ title: titulo, url }).catch(console.error);
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC de um iframe de vídeo instantaneamente (usado nos relacionados)
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (player) {
        // Mantendo o padrão de carregamento do player original
        player.src = `https://www.youtube.com/embed/${idVideo}?autoplay=1`;
    }
}

/**
 * Gerencia o fechamento do modal principal e limpa a URL (remove o ID)
 */
export function fecharModalPrincipal() {
    const modal = document.getElementById('modal-noticia');
    const video = document.getElementById('modal-video');
    
    if (modal) modal.style.display = 'none';
    if (video) video.src = "";
    
    // Limpa o parâmetro ID da URL sem recarregar a página
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
}

/**
 * Controla a abertura e fechamento do modal de comentários
 */
export function toggleComentarios(abrir = true) {
    const modalComentarios = document.getElementById('modal-comentarios-geek');
    if (modalComentarios) {
        if (abrir) {
            modalComentarios.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            modalComentarios.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
}

