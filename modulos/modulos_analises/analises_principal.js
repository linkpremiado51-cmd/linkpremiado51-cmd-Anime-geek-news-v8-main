/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * Sistema com Logs Visuais e Botão de Paginação Forçado
 * Versão Integrada - Corrigindo funções de interface ausentes para evitar travamentos
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

window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) window.abrirModalNoticia(noticia);
    },
    // Adicionado para suportar o carrossel de vídeos na interface
    trocarVideo: (iframeId, videoId) => {
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            window.logVisual("Vídeo trocado.");
        }
    },
    // Adicionado para suportar o botão de compartilhamento na interface
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
    },
    carregarMaisNovo: () => {
        const totalNoBanco = todasAsAnalisesLocais.length;
        
        if (noticiasExibidasCount >= totalNoBanco) {
            window.logVisual(`Fim da lista! (Mostrando ${totalNoBanco} de ${totalNoBanco})`);
        } else {
            noticiasExibidasCount += 5;
            window.logVisual(`Expandindo limite para ${noticiasExibidasCount}...`);
            atualizarInterface();
        }
    }
};

// Delegamento de Eventos (Blindagem)
document.addEventListener('click', (e) => {
    const target = e.target.closest('#btn-carregar-mais');
    if (target) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }
});

async function carregarBlocoEditorial() {
    window.logVisual("Buscando dados editoriais...");
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
            window.logVisual("Editorial carregado.");
        }
    } catch (error) { 
        window.logVisual("Erro no Firebase Editorial."); 
    }
}

/**
 * Tenta encontrar o container e força a injeção do botão
 */
function forcarBotao(tentativas = 0) {
    const btnContainer = document.getElementById('novo-pagination-modulo');

    if (btnContainer) {
        window.logVisual("Container achado. Injetando botão...");
        Interface.renderizarBotaoPaginacao();
    } else if (tentativas < 10) {
        window.logVisual(`Aguardando container... (${tentativas + 1}/10)`);
        setTimeout(() => forcarBotao(tentativas + 1), 1000);
    } else {
        window.logVisual("ERRO: Container não apareceu.");
    }
}

function atualizarInterface() {
    window.logVisual(`Renderizando até ${noticiasExibidasCount} itens...`);
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    forcarBotao();
}

function iniciarSyncNoticias() {
    window.logVisual("Sincronizando banco...");
    onSnapshot(collection(db, "analises"), (snapshot) => {
        window.logVisual(`${snapshot.size} itens no Firebase.`);
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

// Inicialização
criarPainelLogs();
window.logVisual("Sistema Iniciado.");
carregarBlocoEditorial();
iniciarSyncNoticias();
