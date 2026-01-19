/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * Sistema com Logs Visuais e Botão de Paginação Forçado
 * VERSÃO CORRIGIDA: Mantém funções vitais para evitar travamento no carregamento.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// --- SISTEMA DE LOGS VISUAIS PARA CELULAR ---
function criarPainelLogs() {
    if (document.getElementById('debug-mobile')) return;
    const panel = document.createElement('div');
    panel.id = 'debug-mobile';
    panel.style = "position:fixed; top:0; left:0; width:100%; background:rgba(0,0,0,0.8); color:#0f0; font-family:monospace; font-size:10px; z-index:99999; padding:5px; pointer-events:none; max-height:100px; overflow:hidden;";
    document.body.appendChild(panel);
}

window.logVisual = function(msg) {
    const panel = document.getElementById('debug-mobile');
    if (panel) {
        const line = document.createElement('div');
        line.textContent = `> ${new Date().toLocaleTimeString()}: ${msg}`;
        panel.prepend(line);
    }
    console.log(msg);
};
// --------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737",
    measurementId: "G-G5T8CCRGZT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todasAsAnalisesLocais = [];
let noticiasExibidasCount = 5;

// Objeto Global unificado para a Interface
window.analises = {
    ...Funcoes,
    
    // Abre o modal de detalhes (se houver um sistema de modal global de notícias)
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) window.abrirModalNoticia(noticia);
    },

    // Função de carregar mais itens (Paginação)
    carregarMaisNovo: () => {
        const totalNoBanco = todasAsAnalisesLocais.length;
        if (noticiasExibidasCount >= totalNoBanco) {
            window.logVisual(`Fim da lista! (Mostrando ${totalNoBanco})`);
        } else {
            noticiasExibidasCount += 5;
            window.logVisual(`Expandindo para ${noticiasExibidasCount}...`);
            atualizarInterface();
        }
    },

    // Troca o vídeo no iframe (Usado pelo carrossel de relacionados)
    trocarVideo: (iframeId, videoId) => {
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            window.logVisual("Vídeo trocado.");
        }
    },

    // Função de compartilhamento
    compartilharNoticia: (titulo, url) => {
        if (navigator.share) {
            navigator.share({ title: titulo, url: url });
        } else {
            navigator.clipboard.writeText(url);
            const toast = document.getElementById('toast-copiado');
            if (toast) {
                toast.classList.add('mostrar');
                setTimeout(() => toast.classList.remove('mostrar'), 2000);
            }
        }
    }
};

// Delegamento de Eventos para o Botão de Paginação
document.addEventListener('click', (e) => {
    const target = e.target.closest('#btn-carregar-mais');
    if (target) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }
});

async function carregarBlocoEditorial() {
    window.logVisual("Buscando editorial...");
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            const descEl = document.getElementById('capa-descricao');
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
            if (descEl) descEl.textContent = data.descricao || "";
            window.logVisual("Editorial carregado.");
        }
    } catch (error) { 
        window.logVisual("Erro Editorial."); 
    }
}

function forcarBotao(tentativas = 0) {
    const btnContainer = document.getElementById('novo-pagination-modulo');
    if (btnContainer) {
        Interface.renderizarBotaoPaginacao();
    } else if (tentativas < 10) {
        setTimeout(() => forcarBotao(tentativas + 1), 1000);
    }
}

function atualizarInterface() {
    window.logVisual(`Renderizando ${noticiasExibidasCount} itens.`);
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    forcarBotao();
}

function iniciarSyncNoticias() {
    window.logVisual("Conectando ao Firebase...");
    onSnapshot(collection(db, "analises"), (snapshot) => {
        window.logVisual(`${snapshot.size} análises encontradas.`);
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => ({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data(),
                videoPrincipal: doc.data().videoPrincipal?.replace("watch?v=", "embed/") || ""
            }))
            .sort((a, b) => {
                const dataA = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
                const dataB = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
                return dataB - dataA;
            });
        
        atualizarInterface();
    });
}

// Inicialização total
criarPainelLogs();
window.logVisual("Iniciando...");
carregarBlocoEditorial();
iniciarSyncNoticias();
