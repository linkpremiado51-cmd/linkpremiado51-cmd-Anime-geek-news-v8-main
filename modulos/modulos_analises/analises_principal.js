/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * ESTRATÉGIA: Controle Direto para abertura do Modal
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// --- SISTEMA DE LOGS VISUAIS ---
function criarPainelLogs() {
    if (document.getElementById('debug-mobile')) return;
    const panel = document.createElement('div');
    panel.id = 'debug-mobile';
    panel.style = "position:fixed; top:0; left:0; width:100%; background:rgba(0,0,0,0.8); color:#0f0; font-family:monospace; font-size:10px; z-index:99999; padding:5px; pointer-events:none; max-height:80px; overflow:hidden;";
    document.body.appendChild(panel);
}

window.logVisual = function(msg) {
    const panel = document.getElementById('debug-mobile');
    if (panel) {
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        panel.prepend(line);
    }
    console.log(msg);
};

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
    
    // NOVA ESTRATÉGIA: Forçar abertura direta pelo DOM
    toggleComentarios: (abrir, id = null) => {
        const modal = document.getElementById('modal-comentarios-global');
        if (!modal) {
            window.logVisual("ERRO: Estrutura do modal não encontrada no HTML.");
            return;
        }

        if (abrir) {
            window.logVisual("Abrindo Modal para: " + id);
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Se o módulo de comentários existir, carrega as mensagens
            if (window.secaoComentarios && typeof window.secaoComentarios.abrir === 'function') {
                window.secaoComentarios.abrir(id);
            }
        } else {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    trocarVideo: (iframeId, videoId) => {
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            window.logVisual("Vídeo trocado.");
        }
    },

    carregarMaisNovo: () => {
        noticiasExibidasCount += 5;
        atualizarInterface();
    }
};

// OUVINTE GLOBAL DE CLIQUES
document.addEventListener('click', (e) => {
    // Clique na barra de comentários
    const trigger = e.target.closest('.comments-trigger-bar');
    if (trigger) {
        e.preventDefault();
        const artigo = trigger.closest('article');
        const id = artigo ? artigo.id.replace('artigo-', '') : null;
        if (id) window.analises.toggleComentarios(true, id);
        return;
    }

    // Clique no botão carregar mais
    if (e.target.closest('#btn-carregar-mais')) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }
});

async function carregarBlocoEditorial() {
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            const descEl = document.getElementById('capa-descricao');
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
            if (descEl) descEl.textContent = data.descricao || "";
        }
    } catch (error) { 
        window.logVisual("Erro Editorial."); 
    }
}

function atualizarInterface() {
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao();
}

function iniciarSyncNoticias() {
    window.logVisual("Sincronizando banco...");
    try {
        onSnapshot(collection(db, "analises"), (snapshot) => {
            window.logVisual(`${snapshot.size} itens recebidos.`);
            todasAsAnalisesLocais = snapshot.docs
                .map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    videoPrincipal: doc.data().videoPrincipal?.replace("watch?v=", "embed/") || ""
                }))
                .sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));
            
            atualizarInterface();
        }, (err) => {
            window.logVisual("Erro Firebase: " + err.code);
        });
    } catch (e) {
        window.logVisual("Falha na sincronização.");
    }
}

// Inicialização
criarPainelLogs();
carregarBlocoEditorial();
iniciarSyncNoticias();
