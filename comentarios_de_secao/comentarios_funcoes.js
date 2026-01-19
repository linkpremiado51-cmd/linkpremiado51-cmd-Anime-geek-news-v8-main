/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * Lógica de controle e persistência de comentários
 */

/**
 * Controla a exibição do modal de comentários
 */
export function toggleComentarios(abrir = true, idConteudo = null) {
    const modal = document.getElementById('modal-comentarios-global');
    if (!modal) return;

    if (abrir) {
        modal.style.display = 'flex';
        // Delay para animação CSS
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';

        if (idConteudo) {
            console.log(`[Módulo Comentários] Carregando discussão para: ${idConteudo}`);
            // Aqui entra a chamada futura para o Firebase
        }
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
}

/**
 * Limpa o campo de texto após o envio
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        input.focus();
    }
}
