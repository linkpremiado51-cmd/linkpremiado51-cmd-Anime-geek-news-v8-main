/**
 * ARQUIVO: modulos/modulos_analises/analises_interface.js
 * Interface Modularizada - Versão Unificada (Notícias + Comentários)
 */

import { limparEspacos } from './analises_funcoes.js';

function logInterface(msg) {
    if (typeof window.logVisual === 'function') {
        window.logVisual(msg);
    }
}

/**
 * RENDERIZAÇÃO DE COMENTÁRIOS (Unificado)
 */
export function renderizarListaComentarios(comentarios) {
    const listaCorpo = document.getElementById('lista-comentarios-global');
    if (!listaCorpo) return;

    if (comentarios.length === 0) {
        listaCorpo.innerHTML = `
            <div style="text-align:center; padding:40px; opacity:0.5;">
                <i class="fas fa-comment-slash" style="font-size:2rem; margin-bottom:10px;"></i>
                <p>Nenhum comentário ainda. Seja o primeiro!</p>
            </div>`;
        return;
    }

    listaCorpo.innerHTML = comentarios.map(c => {
        // Gera uma cor ou avatar baseado no nome (Simples)
        const inicial = c.autor ? c.autor.charAt(0).toUpperCase() : "G";
        
        return `
            <div class="comentario-item">
                <div class="comentario-autor">${c.autor || 'Anônimo'}</div>
                <div class="comentario-texto-wrapper">
                    <div class="comentario-texto">${c.texto}</div>
                </div>
            </div>
        `;
    }).join('');

    // Scroll automático para o último comentário
    listaCorpo.scrollTop = listaCorpo.scrollHeight;
}

/**
 * Cria o HTML da ficha técnica
 */
export function criarFichaHtml(ficha) {
    if (!ficha || !Array.isArray(ficha)) return "";
    return ficha.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-valor">${item.valor}</span>
        </div>
    `).join('');
}

/**
 * Gera o HTML dos vídeos relacionados
 */
function criarRelacionadosHtml(newsId, relacionados) {
    if (!relacionados || !Array.isArray(relacionados)) return "";
    return relacionados.map(rel => `
        <div class="tema-card" onclick="window.analises.trocarVideo('player-${newsId}', '${rel.idVid}')">
            <div class="thumb-wrapper">
                <img src="${limparEspacos(rel.thumb)}" class="tema-thumb" alt="${rel.titulo}">
                <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="tema-titulo">${rel.titulo}</div>
        </div>
    `).join('');
}

/**
 * Injeta o botão de paginação
 */
export function renderizarBotaoPaginacao() {
    const paginationWrapper = document.getElementById('novo-pagination-modulo');
    if (!paginationWrapper) return;

    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 60px 0; width: 100%;">
            <button class="btn-paginacao-geek" id="btn-carregar-mais">
                <i class="fa-solid fa-chevron-down"></i>
                <span>Carregar mais análises</span>
            </button>
        </div>
    `;
}

/**
 * Renderiza a lista de notícias
 */
export function renderizarNoticias(noticias, limite) {
    const container = document.getElementById('container-principal');
    if (!container) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const listaParaExibir = noticias.slice(0, limite);

    if (listaParaExibir.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:80px; opacity:0.6;"><p>Nenhuma análise encontrada.</p></div>`;
        return;
    }

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || "100K";

        return `
        <article class="destaque-secao" id="artigo-${news.id}" style="--tema-cor: ${news.cor || '#8A2BE2'}">
          <div class="destaque-padding">
            <div class="destaque-top-meta">
                <div class="destaque-categoria"><i class="fa-solid fa-hashtag"></i> ${news.categoria || 'ANÁLISE'}</div>
                <div class="destaque-data-badge"><i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '5 min'}</div>
            </div>
            <h2 class="destaque-titulo">${news.titulo}</h2>
            <p class="destaque-resumo">${news.resumo || ''}</p>
            <div class="destaque-info-grid">${criarFichaHtml(news.ficha)}</div>
          </div>

          <div class="destaque-media">
            <iframe id="player-${news.id}" src="${limparEspacos(news.videoPrincipal)}" allowfullscreen></iframe>
          </div>

          <div class="premium-actions-bar">
            <button class="btn-premium-icon" onclick="window.analises.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
              <i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span>
            </button>
            <div class="stats-group">
                <i class="fa-solid fa-chart-line"></i> <span class="stats-num">${viewCount} visualizações</span>
            </div>
          </div>

          <div class="carrossel-temas">
            <div class="carrossel-header"><i class="fa-solid fa-film"></i> <span>Vídeos Relacionados</span></div>
            <div class="temas-scroll-wrapper">
                <div class="temas-container">${criarRelacionadosHtml(news.id, news.relacionados)}</div>
            </div>
          </div>

          <div class="comments-trigger-bar" onclick="window.analises.abrirComentarios('${news.id}')">
            <div class="trigger-left" style="color: #8A2BE2; font-weight: 700; font-size: 0.85rem;">
              <i class="fa-solid fa-circle-nodes"></i> <span>Ver discussão da comunidade...</span>
            </div>
            <i class="fa-solid fa-comments"></i>
          </div>
        </article>
      `;
    }).join('');
}
