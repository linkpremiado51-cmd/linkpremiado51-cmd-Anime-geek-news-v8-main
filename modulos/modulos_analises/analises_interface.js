/**
 * modulos/modulos_analises/analises_interface.js
 * Responsável por renderizar o HTML e controlar elementos da interface
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
 * Abre a notícia selecionada em um Modal
 */
export function abrirNoticiaEmModal(noticia) {
    const modal = document.getElementById('modal-noticia');
    if (!modal) return;

    document.getElementById('modal-titulo').innerText = noticia.titulo;
    document.getElementById('modal-categoria').innerHTML = `<i class="fa-solid fa-video"></i> ${noticia.categoria}`;
    document.getElementById('modal-resumo').innerText = noticia.resumo;
    document.getElementById('modal-link').href = noticia.linkArtigo;
    document.getElementById('modal-ficha').innerHTML = criarFichaHtml(noticia.ficha);
    document.getElementById('modal-video').src = limparEspacos(noticia.videoPrincipal);
    
    modal.style.display = 'block';
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
    const btnPaginacao = document.getElementById('pagination-control');
    if (!container) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const listaParaExibir = noticias.slice(0, limite);

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = Math.floor(Math.random() * 900) + 100 + "K";

        return `
        <article class="destaque-secao" id="artigo-${news.id}" style="--tema-cor: ${news.cor}">
          <div class="destaque-padding">
            <div class="destaque-categoria"><i class="fa-solid fa-hashtag"></i> ${news.categoria}</div>
            <div class="destaque-header">
              <h2 class="destaque-titulo">${news.titulo}</h2>
              <div class="menu-opcoes-container" tabindex="0">
                <button class="btn-tres-pontos"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                <div class="dropdown-conteudo header-dropdown">
                  <a href="#"><i class="fa-regular fa-bookmark"></i> Salvar</a>
                  <a href="#" onclick="event.preventDefault(); window.analises.copiarLink('${shareUrl}');">
                    <i class="fa-regular fa-copy"></i> Copiar Link
                  </a>
                </div>
              </div>
            </div>
            <p class="destaque-resumo">${news.resumo}</p>
            <a href="${news.linkArtigo}" class="btn-ver-artigo"><i class="fa-solid fa-book-open"></i> Ver artigo completo</a>
            <div class="destaque-info-grid">
              ${criarFichaHtml(news.ficha)}
            </div>
          </div>
          <div class="destaque-media">
            <iframe id="player-${news.id}" src="${limparEspacos(news.videoPrincipal)}" allowfullscreen></iframe>
          </div>
          <div class="premium-actions-bar">
            <div class="menu-opcoes-container" tabindex="0" style="position: relative;">
              <button class="btn-premium-icon"><i class="fa-regular fa-thumbs-up"></i> Útil</button>
              <div class="dropdown-conteudo dropdown-up">
                <a href="#"><i class="fa-solid fa-circle-play"></i> Curti vídeo</a>
                <a href="#"><i class="fa-solid fa-newspaper"></i> Curti artigo</a>
                <a href="#"><i class="fa-solid fa-user-pen"></i> Curti editor</a>
                <hr>
                <a href="#"><i class="fa-solid fa-minus"></i> Ver menos</a>
                <a href="#"><i class="fa-solid fa-plus"></i> Ver mais</a>
              </div>
            </div>
            <button class="btn-premium-icon" onclick="window.analises.compartilhar('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
              <i class="fa-solid fa-share-nodes"></i> Compartilhar
            </button>
            <button class="btn-premium-icon btn-stats" onclick="alert('${viewCount} visualizações')">
              <i class="fa-solid fa-chart-column"></i>
              <span class="stats-num">${viewCount}</span>
            </button>
            <button class="btn-premium-icon btn-monetize" onclick="alert('Você ganhou pontos Geek!')">
              <i class="fa-regular fa-gem"></i>
            </button>
          </div>
          <div class="carrossel-temas">
            <div class="carrossel-header"><span class="temas-label">Vídeos Relacionados</span></div>
            <div class="temas-scroll-wrapper"><div class="temas-container">
              ${criarRelacionadosHtml(news.id, news.relacionados)}
            </div></div>
          </div>
          <div class="comments-trigger-bar" onclick="window.analises.toggleComentarios(true, '${news.id}')">
            <div class="trigger-left">
              <div class="avatars-stack">
                <div class="av-s" style="background:#555"></div>
                <div class="av-s" style="background:#777"></div>
                <div class="av-s" style="background:#999"></div>
              </div>
              <span>Discussão da comunidade...</span>
            </div>
            <i class="fa-solid fa-chevron-right" style="opacity: 0.5;"></i>
          </div>
        </article>
      `;
    }).join('');

    if (btnPaginacao) {
        btnPaginacao.style.display = limite < noticias.length ? 'block' : 'none';
    }
}

