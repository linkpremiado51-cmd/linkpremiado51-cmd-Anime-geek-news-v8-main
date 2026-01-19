/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * STATUS: Unificado (Controle total de Notícias e Comentários)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// --- CONFIGURAÇÃO E LOGS ---
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
let idComentariosAtivo = null;
let unsubscribeComentarios = null;

// --- SISTEMA DE LOGS ---
function criarPainelLogs() {
    if (document.getElementById('debug-mobile')) return;
    const panel = document.createElement('div');
    panel.id = 'debug-mobile';
    panel.style = "position:fixed; top:0; left:0; width:100%; background:rgba(0,0,0,0.8); color:#0f0; font-family:monospace; font-size:10px; z-index:999999; padding:5px; pointer-events:none; max-height:60px; overflow:hidden;";
    document.body.appendChild(panel);
}

window.logVisual = (msg) => {
    const panel = document.getElementById('debug-mobile');
    if (panel) {
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        panel.prepend(line);
    }
};

// --- LÓGICA UNIFICADA DE COMENTÁRIOS ---

async function carregarMensagensFirebase(id) {
    if (unsubscribeComentarios) unsubscribeComentarios();
    idComentariosAtivo = id;

    const colRef = collection(db, "analises", id, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeComentarios = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
    });
}

async function enviarMensagemFirebase() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idComentariosAtivo) return;

    const texto = input.value.trim();
    input.value = ""; // Limpeza rápida

    try {
        await addDoc(collection(db, "analises", idComentariosAtivo, "comentarios"), {
            autor: "Leitor Geek",
            texto: texto,
            data: serverTimestamp()
        });
    } catch (e) {
        window.logVisual("Erro ao comentar.");
    }
}

// --- API GLOBAL ---
window.analises = {
    ...Funcoes,
    
    abrirComentarios: (id) => {
        const modal = document.getElementById('modal-comentarios-global');
        if (!modal) return;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
        
        carregarMensagensFirebase(id);
        window.logVisual("Discussão: " + id);
    },

    fecharComentarios: () => {
        const modal = document.getElementById('modal-comentarios-global');
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (!modal.classList.contains('active')) modal.style.display = 'none';
        }, 400);

        if (unsubscribeComentarios) unsubscribeComentarios();
        idComentariosAtivo = null;
    },

    carregarMaisNovo: () => {
        noticiasExibidasCount += 5;
        atualizarInterface();
    }
};

// --- OUVINTE GLOBAL DE EVENTOS ---
document.addEventListener('click', (e) => {
    // 1. Fechar Modal
    if (e.target.closest('#btn-fechar-comentarios') || e.target.classList.contains('modal-comentarios-overlay')) {
        window.analises.fecharComentarios();
    }
    // 2. Enviar Comentário
    if (e.target.closest('#btn-enviar-comentario')) {
        enviarMensagemFirebase();
    }
    // 3. Botão Carregar Mais
    if (e.target.closest('#btn-carregar-mais')) {
        window.analises.carregarMaisNovo();
    }
});

// Enviar com Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        enviarMensagemFirebase();
    }
});

// --- SINCRONIZAÇÃO DE NOTÍCIAS ---
function atualizarInterface() {
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao();
}

function iniciarSyncNoticias() {
    window.logVisual("Sincronizando banco...");
    onSnapshot(collection(db, "analises"), (snapshot) => {
        todasAsAnalisesLocais = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            videoPrincipal: doc.data().videoPrincipal?.replace("watch?v=", "embed/") || ""
        })).sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0));
        atualizarInterface();
    });
}

// Inicialização
criarPainelLogs();
iniciarSyncNoticias();
