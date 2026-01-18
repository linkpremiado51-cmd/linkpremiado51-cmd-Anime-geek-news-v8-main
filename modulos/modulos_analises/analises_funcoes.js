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
 * Altera o SRC de um iframe de vídeo (Sincronizado com lógica config-firebase.js)
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (player && idVideo) {
        // Aplica a lógica de parâmetros do sistema antigo para garantir o autoplay
        const params = "?autoplay=1&mute=1&modestbranding=1";
        
        // Verifica se é um ID puro ou URL completa para formatar corretamente
        let novoSrc = idVideo.includes('youtube.com') ? idVideo : `https://www.youtube.com/embed/${idVideo}`;
        
        // Se usar o proxy googleusercontent que você mencionou:
        if (idVideo.startsWith('http://googleusercontent.com')) {
             player.src = idVideo + params;
        } else {
             player.src = novoSrc + params;
        }
    }
}

/**
 * Gerencia o fechamento do modal e limpa a URL
 */
export function fecharModalPrincipal() {
    if (window.fecharModal) {
        window.fecharModal();
    } else {
        const modal = document.getElementById('modal-noticia');
        if (modal) modal.style.display = 'none';
    }
    
    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url.pathname);
    }
}

/**
 * Controla o modal de comentários da comunidade
 */
export function toggleComentarios(abrir = true, idNoticia = null) {
    const modalComentarios = document.getElementById('modal-comentarios-geek');
    if (!modalComentarios) return;

    if (abrir) {
        modalComentarios.style.display = 'flex';
        setTimeout(() => {
            modalComentarios.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
        
        if (idNoticia) console.log("Carregando comentários para:", idNoticia);
        
    } else {
        modalComentarios.classList.remove('active');
        setTimeout(() => {
            modalComentarios.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
}
