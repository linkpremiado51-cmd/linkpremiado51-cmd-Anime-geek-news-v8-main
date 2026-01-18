/**
 * modulos/modulos_analises/analises_interface.js
 * Ajuste: Sincronização com a estrutura do analises.html
 */

import { copiarLink, compartilharNoticia, trocarVideo, toggleComentarios, limparEspacos } from './analises_funcoes.js';

export function criarFichaHtml(ficha) {
    if (!ficha || !Array.isArray(ficha)) return "";
    return ficha.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-valor">${item.valor}</span>
        </div>
    `).join('');
}

function criarRelacionadosHtml(newsId, relacionados) {
    if (!relacionados || !Array.isArray(relacionados)) return "";
    return relacionados.map(rel => `
        <div class="tema-card" onclick="window.analises.trocarVideo('player-${newsId}', '${rel.idVid}')">
            <img src="${limparEspacos(rel.thumb)}" class="tema-thumb">
            <div class="tema-titulo">${rel.titulo}</div>
        </div>
    `).join('');
}

export function renderizarNoticias(noticias, limite) {
    const container = document.getElementById('container-principal');
    const paginacaoWrapper = document.getElementById('pagination-control');
    
    if (!container) return;

    container.innerHTML = '';

    const baseUrl = window.location.origin + window.location.pathname;
    const listaParaExibir = noticias.slice(0, limite);

    if (listaParaExibir.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:100px; opacity:0.5;">Nenhuma análise encontrada.</p>';
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
            <iframe id="player-${news.id}" src="https://www.youtube.com/embed/${limparEspacos(news.videoPrincipal)}" allowfullscreen></iframe>
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
              <i class="fa-solid fa-comments"></i>
              <span>Ver discussão da comunidade...</span>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
          </div>
        </article>
      `;
    }).join('');

    // Ajuste de visibilidade do Botão Carregar Mais
    if (paginacaoWrapper) {
        // Agora comparando corretamente se há mais itens no array do que o limite atual
        if (noticias.length > limite) {
            paginacaoWrapper.style.setProperty('display', 'block', 'important');
        } else {
            paginacaoWrapper.style.display = 'none';
        }
    }
}
