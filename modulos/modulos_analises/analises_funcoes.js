/**
 * modulos/modulos_analises/analises_funcoes.js
 * Funções utilitárias e suporte visual
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
 * Aciona o compartilhamento nativo ou fallback
 */
export function compartilharNoticia(titulo, url) {
    const shareData = { title: titulo, url: url };
    if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(console.error);
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC de um iframe de vídeo (Proxy de imagem/vídeo do Google)
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (player && idVideo) {
        // Ajustado para o padrão de proxy que você utiliza
        player.src = `https://www.youtube.com/embed/$${idVideo}?autoplay=1`;
    }
}

/**
 * Gerencia o fechamento do modal e limpa a URL
 * Integrado ao sistema de navegação global
 */
export function fecharModalPrincipal() {
    // Tenta chamar a função global de fechar modal do index.html
    if (window.fecharModal) {
        window.fecharModal();
    } else {
        const modal = document.getElementById('modal-noticia');
        if (modal) modal.style.display = 'none';
    }
    
    // Limpa o ID da URL de forma limpa
    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url.pathname);
    }
}

/**
 * Controla o modal de comentários da comunidade
 * Ajustado para corrigir o erro visual das imagens enviadas
 */
export function toggleComentarios(abrir = true, idNoticia = null) {
    const modalComentarios = document.getElementById('modal-comentarios-geek');
    if (!modalComentarios) return;

    if (abrir) {
        // Primeiro garante que o container existe visualmente
        modalComentarios.style.display = 'flex';
        // Pequeno delay para a transição CSS 'active' funcionar suavemente
        setTimeout(() => {
            modalComentarios.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
        
        // Se houver um ID, você pode disparar a carga de comentários aqui futuramente
        if (idNoticia) console.log("Carregando comentários para:", idNoticia);
        
    } else {
        modalComentarios.classList.remove('active');
        // Espera a animação de saída (0.3s) antes de esconder o display
        setTimeout(() => {
            modalComentarios.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
}
