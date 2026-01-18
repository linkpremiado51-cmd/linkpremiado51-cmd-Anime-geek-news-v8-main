/**
 * modulos/modulos_analises/analises_interface.js
 * Restaurado: Versão estável com correção apenas na visibilidade do botão
 */

import { copiarLink, compartilharNoticia, trocarVideo, toggleComentarios, limparEspacos } from './analises_funcoes.js';

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
            <img src="${limparEspacos(rel.thumb)}" class="tema-thumb">
            <div class="tema-titulo">${rel.titulo}</div>
        </div>
    `).join('');
}

/**
 * Renderiza a lista de notícias no container principal
 */
export function renderizarNoticias(noticias, limite) {
    const container = document.getElementById('container-principal');
    const paginacaoWrapper = document.getElementById('pagination-control');
    
    if (!container) return;

    // Limpa o container antes de renderizar
    container.innerHTML = '';

    const baseUrl = window.location.origin + window.location.pathname;
    const listaParaExibir = noticias.slice(0, limite);

    if (listaParaExibir.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px; opacity:0.5;">Nenhuma análise encontrada nesta categoria.</p>';
        if (paginacaoWrapper) paginacaoWrapper.style.display = 'none';
        return;
    }

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || Math.floor(Math.random() * 900) + 100 + "K";

        return `
        <article class="destaque-secao" id="artigo-${news.id}" style="--tema-cor: ${news.cor || '#8A2BE2'}">
          <div class="destaque-padding">
            <div class="destaque-categoria" onclick="window.analises.abrirNoModalGlobal('${news.id}')" style="cursor:pointer">
                <i class="fa-solid fa-hashtag"></i> ${news.categoria || 'ANÁLISE'}
            </div>
            
            <div class="destaque-header">
              <h2 class="destaque-titulo" onclick="window.analises.abrirNoModalGlobal('${news.id}')" style="cursor:pointer">
                ${news.titulo}
              </h2>
            </div>

            <p class="destaque-resumo">${news.resumo || ''}</p>
            
            <div class="destaque-info-grid">
              ${criarFichaHtml(news.ficha)}
            </div>
          </div>

          <div class="destaque-media">
            <iframe id="player-${news.id}" src="${limparEspacos(news.videoPrincipal)}" allowfullscreen></iframe>
          </div>

          <div class="premium-actions-bar">
            <button class="btn-premium-icon" onclick="window.analises.compartilhar('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
              <i class="fa-solid fa-share-nodes"></i> Compartilhar
            </button>
            <button class="btn-premium-icon btn-stats">
              <i class="fa-solid fa-chart-column"></i>
              <span class="stats-num">${viewCount}</span>
            </button>
          </div>

          <div class="carrossel-temas">
            <div class="carrossel-header"><span class="temas-label">Vídeos Relacionados</span></div>
            <div class="temas-scroll-wrapper">
                <div class="temas-container">
                    ${criarRelacionadosHtml(news.id, news.relacionados)}
                </div>
            </div>
          </div>

          <div class="comments-trigger-bar" onclick="window.analises.toggleComentarios(true, '${news.id}')">
            <div class="trigger-left">
              <span>Ver discussão da comunidade...</span>
            </div>
            <i class="fa-solid fa-comments"></i>
          </div>
        </article>
      `;
    }).join('');

    // Correção da visibilidade: Se tiver mais notícias no total do que o limite atual, mostra o botão
    if (paginacaoWrapper) {
        if (noticias.length > limite) {
            paginacaoWrapper.style.display = 'block';
        } else {
            paginacaoWrapper.style.display = 'none';
        }
    }
}
