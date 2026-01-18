/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * Sistema com Logs Visuais para Mobile e Busca Persistente
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

function logVisual(msg) {
    const panel = document.getElementById('debug-mobile');
    if (panel) {
        const line = document.createElement('div');
        line.textContent = `> ${new Date().toLocaleTimeString()}: ${msg}`;
        panel.prepend(line);
    }
    console.log(msg);
}
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
    carregarMaisNovo: () => {
        logVisual("Botão clicado! Carregando +5...");
        noticiasExibidasCount += 5;
        atualizarInterface();
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
    logVisual("Buscando dados editoriais...");
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
            logVisual("Editorial carregado.");
        }
    } catch (error) { 
        logVisual("Erro no Firebase Editorial."); 
    }
}

/**
 * Tenta encontrar o container do botão repetidamente
 */
function forcarBotao(tentativas = 0) {
    const btnContainer = document.getElementById('novo-pagination-modulo');
    const temMais = todasAsAnalisesLocais.length > noticiasExibidasCount;

    if (btnContainer) {
        logVisual("Container do botão ENCONTRADO!");
        if (temMais) Interface.renderizarBotaoPaginacao();
    } else if (tentativas < 10) {
        logVisual(`Container não achado. Tentativa ${tentativas + 1}/10...`);
        setTimeout(() => forcarBotao(tentativas + 1), 1000);
    } else {
        logVisual("ERRO: Container 'novo-pagination-modulo' não apareceu no DOM.");
    }
}

function atualizarInterface() {
    logVisual(`Renderizando ${noticiasExibidasCount} notícias...`);
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    forcarBotao();
}

function iniciarSyncNoticias() {
    logVisual("Iniciando Sync com Firebase...");
    onSnapshot(collection(db, "analises"), (snapshot) => {
        logVisual(`${snapshot.size} análises recebidas.`);
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => ({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data(),
                videoPrincipal: doc.data().videoPrincipal?.replace("watch?v=", "embed/") || ""
            }))
            .sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));
        
        atualizarInterface();
    });
}

// Inicialização
criarPainelLogs();
logVisual("Sistema Iniciado.");
carregarBlocoEditorial();
iniciarSyncNoticias();
