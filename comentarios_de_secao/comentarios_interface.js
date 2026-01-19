/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * Responsável por gerar e injetar o HTML do sistema de comentários
 */

/**
 * Cria a estrutura base do modal no DOM se ela não existir
 */
export function injetarEstruturaModal() {
    // Evita duplicatas
    if (document.getElementById('modal-comentarios-global')) return;

    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay">
            <div class="modal-comentarios-content">
                <div class="comentarios-header">
                    <div class="header-label">
                        <i class="fa-solid fa-comments" style="color: #8A2BE2;"></i>
                        <span style="margin-left:8px; font-weight:bold;">Comunidade</span>
                        <small id="comentarios-subtitulo" style="display:block; opacity:0.6; font-size:10px;">Discussão Ativa</small>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios" onclick="window.secaoComentarios.fechar()">&times;</button>
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
    console.log("Interface: Estrutura do modal injetada no body.");
}

/**
 * Gera o HTML de um único balão de comentário
 */
export function criarBalaoComentario(autor, texto, inicial = "G") {
    const nomeExibicao = autor || "Anônimo";
    const letra = nomeExibicao.charAt(0).toUpperCase();
    
    return `
        <div class="comentario-item" style="display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start;">
            <div class="comentario-avatar" style="width: 32px; height: 32px; background: #8A2BE2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                ${letra}
            </div>
            <div class="comentario-texto-wrapper" style="background: rgba(138, 43, 226, 0.05); padding: 10px; border-radius: 0 12px 12px 12px; flex-grow: 1; border: 1px solid rgba(138, 43, 226, 0.1);">
                <strong class="comentario-autor" style="display: block; font-size: 0.75rem; color: #8A2BE2; margin-bottom: 2px;">${nomeExibicao}</strong>
                <p class="comentario-texto" style="margin: 0; font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${texto}</p>
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

    if (!comentarios || comentarios.length === 0) {
        listaContainer.innerHTML = `
            <div style="text-align:center; padding:40px 20px; opacity:0.5;">
                <i class="fa-solid fa-comments" style="font-size:2rem; margin-bottom:10px; display:block; color: #8A2BE2;"></i>
                <p style="font-size:0.9rem;">Nenhum comentário ainda.<br>Seja o primeiro a participar!</p>
            </div>`;
        return;
    }

    // Renderiza a lista de balões
    listaContainer.innerHTML = comentarios.map(c => 
        criarBalaoComentario(c.nome || c.autor || c.usuario, c.texto || c.comentario || c.msg)
    ).join('');

    // Rola suavemente para o final
    setTimeout(() => {
        listaContainer.scrollTo({ top: listaContainer.scrollHeight, behavior: 'smooth' });
    }, 100);
}
