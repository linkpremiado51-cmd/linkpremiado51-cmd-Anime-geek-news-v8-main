/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * Responsável por gerar e injetar o HTML do sistema de comentários
 */

/**
 * Cria a estrutura base do modal no DOM se ela não existir
 */
export function injetarEstruturaModal() {
    if (document.getElementById('modal-comentarios-global')) return;

    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay">
            <div class="modal-comentarios-content">
                <div class="comentarios-header">
                    <div class="header-label">
                        <span>Comunidade</span>
                        <small id="comentarios-subtitulo">Discussão Ativa</small>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios">&times;</button>
                </div>
                
                <div id="lista-comentarios-fluxo" class="comentarios-body">
                    </div>

                <div class="comentarios-footer">
                    <div class="input-container-global">
                        <input type="text" id="input-novo-comentario" placeholder="Escreva algo...">
                        <button id="btn-enviar-global" class="btn-enviar-comentario">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Gera o HTML de um único balão de comentário
 */
export function criarBalaoComentario(autor, texto, inicial = "G") {
    return `
        <div class="comentario-item">
            <div class="comentario-avatar">${inicial}</div>
            <div class="comentario-texto-wrapper">
                <strong class="comentario-autor">${autor}</strong>
                <p class="comentario-texto">${texto}</p>
            </div>
        </div>
    `;
}
