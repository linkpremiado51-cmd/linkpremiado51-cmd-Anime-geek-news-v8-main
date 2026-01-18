/**
 * modulos/modulos_analises/analises_interface.js
 * Interface Modularizada com injeção em placeholder fixo para evitar conflitos de navegação.
 */

import { limparEspacos } from './analises_funcoes.js';

/**
 * Cria o HTML da ficha técnica (grid de informações)
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
 * Gera o HTML dos vídeos relacionados (carrossel)
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
 * Renderiza o botão de "Carregar Mais" no placeholder fixo do HTML
 */
export function renderizarBotaoPaginacao(callback) {
    // Busca o placeholder que adicionamos manualmente no analises.html
    const paginationWrapper = document.getElementById('novo-pagination-modulo');
    
    // Se o placeholder não existir (ex: erro de carregamento da seção), encerra
    if (!paginationWrapper) return;

    // Injeta o botão com o estilo Geek
    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 60px 0; width: 100%;">
            <button class="btn-paginacao-geek" id="btn-carregar-mais">
                <i class="fa-solid fa-chevron-down"></i>
                <span>Carregar mais análises</span>
            </button>
        </div>
    `;

    const btn = paginationWrapper.querySelector('#btn-carregar-mais');
    if (btn) btn.onclick = callback;
}

/**
 * Renderiza a lista de notícias no container principal
 */
export function renderizarNoticias(noticias, limite) {
    const container = document.getElementById('container-principal');
    if (!container) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const listaParaExibir = noticias.slice(0, limite);

    if (listaParaExibir.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:80px 20px; opacity:0.6;">
                <i class="fa-solid fa-layer-group" style="font-size:3rem; margin-bottom:20px; display:block;"></i>
                <p>Nenhuma análise encontrada nesta categoria.</p>
            </div>`;
        return;
    }

    // Renderiza os artigos
    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || Math.floor(Math.random() * 900) + 100 + "K";

        return `
        <article class="destaque-secao" id="artigo-${news.id}" style="--tema-cor: ${news.cor || '#8A2BE2'}">
          <div class="destaque-padding">
            <div class="destaque-top-meta">
                <div class="destaque-categoria" onclick="window.analises.abrirNoModalGlobal('${news.id}')">
                    <i class="fa-solid fa-hashtag"></i> ${news.categoria || 'ANÁLISE'}
                </div>
                <div class="destaque-data-badge">
                    <i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '5 min'}
                </div>
            </div>
            
            <div class="destaque-header">
              <h2 class="destaque-titulo" onclick="window.analises.abrirNoModalGlobal('${news.id}')">
                ${news.titulo}
              </h2>
            </div>

            <p class="destaque-resumo">${news.resumo || ''}</p>
            
            <div class="destaque-info-grid">
              ${criarFichaHtml(news.ficha)}
            </div>
          </div>

          <div class="destaque-media">
            <iframe 
                id="player-${news.id}" 
                src="${limparEspacos(news.videoPrincipal)}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
          </div>

          <div class="premium-actions-bar">
            <button class="btn-premium-icon" onclick="window.analises.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
              <i class="fa-solid fa-share-nodes"></i> 
              <span>Compartilhar</span>
            </button>
            <div class="stats-group">
                <i class="fa-solid fa-chart-line"></i>
                <span class="stats-num">${viewCount} visualizações</span>
            </div>
          </div>

          <div class="carrossel-temas">
            <div class="carrossel-header">
                <i class="fa-solid fa-film"></i>
                <span class="temas-label">Vídeos Relacionados</span>
            </div>
            <div class="temas-scroll-wrapper">
                <div class="temas-container">
                    ${criarRelacionadosHtml(news.id, news.relacionados)}
                </div>
            </div>
          </div>

          <div class="comments-trigger-bar" onclick="window.analises.toggleComentarios(true, '${news.id}')">
            <div class="trigger-left">
              <i class="fa-solid fa-circle-nodes"></i>
              <span>Ver discussão da comunidade...</span>
            </div>
            <div class="trigger-right">
                <i class="fa-solid fa-comments"></i>
            </div>
          </div>
        </article>
      `;
    }).join('');
}
