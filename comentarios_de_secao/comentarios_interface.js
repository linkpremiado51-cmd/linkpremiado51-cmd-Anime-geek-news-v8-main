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
                    <p style="text-align:center; padding:20px; opacity:0.5;">Carregando mensagens...</p>
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
    // Pega a primeira letra do nome se o autor existir
    const letra = autor ? autor.charAt(0).toUpperCase() : inicial;
    
    return `
        <div class="comentario-item" style="display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start;">
            <div class="comentario-avatar" style="width: 35px; height: 35px; background: #8A2BE2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                ${letra}
            </div>
            <div class="comentario-texto-wrapper">
                <strong class="comentario-autor" style="display: block; font-size: 0.85rem; color: var(--text-main);">${autor || "Anônimo"}</strong>
                <p class="comentario-texto" style="margin: 2px 0 0 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.4;">${texto}</p>
            </div>
        </div>
    `;
}

/**
 * Recebe o array do Firebase e renderiza na tela
 */
export function renderizarListaComentarios(comentarios) {
    const listaContainer = document.getElementById('lista-comentarios-fluxo');
    if (!listaContainer) return;

    if (comentarios.length === 0) {
        listaContainer.innerHTML = `
            <div style="text-align:center; padding:40px 20px; opacity:0.5;">
                <i class="fa-solid fa-comments" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                <p>Nenhum comentário ainda. Seja o primeiro a participar!</p>
            </div>`;
        return;
    }

    // Mapeia os comentários e transforma em HTML
    listaContainer.innerHTML = comentarios.map(c => 
        criarBalaoComentario(c.nome || c.autor, c.texto || c.comentario)
    ).join('');

    // Rola para o final da lista para ver a última mensagem
    listaContainer.scrollTop = listaContainer.scrollHeight;
}
