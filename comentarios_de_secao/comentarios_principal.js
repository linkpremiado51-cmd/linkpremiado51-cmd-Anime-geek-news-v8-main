/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * Ponto de entrada do módulo global de comentários com Logs Visuais
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let unsubscribeAtual = null;
let idConteudoAtual = null;

/**
 * Função para carregar comentários em tempo real do Firebase
 */
async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    if (window.logVisual) window.logVisual(`Conectando mensagens de: ${idConteudo}`);
    
    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.logVisual) window.logVisual(`${comentarios.length} mensagens lidas.`);
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        if (window.logVisual) window.logVisual("Erro Firebase Comentários.");
        console.error(error);
    });
}

/**
 * Função para enviar novo comentário
 */
async function enviarComentario() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) return;

    const texto = input.value.trim();
    input.value = ""; // Limpa campo imediatamente para feedback visual

    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: "Leitor Geek",
            texto: texto,
            data: serverTimestamp()
        });
        if (window.logVisual) window.logVisual("Comentário enviado!");
    } catch (error) {
        if (window.logVisual) window.logVisual("Erro ao enviar comentário.");
        console.error(error);
    }
}

// DEFINIÇÃO GLOBAL REFORÇADA
const apiComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`Solicitando abertura: ${id}`);
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("Solicitando fechamento.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        Funcoes.toggleComentarios(false);
    },
    enviar: enviarComentario
};

window.secaoComentarios = apiComentarios;

// --- OUVINTES DE EVENTOS ---
document.addEventListener('click', (e) => {
    // 1. Fechar modal (X ou fundo)
    const clicouNoX = e.target.closest('.btn-close-comentarios') || e.target.id === 'btn-fechar-comentarios';
    const clicouNoFundo = e.target.classList.contains('modal-comentarios-overlay');

    if (clicouNoX || clicouNoFundo) {
        window.secaoComentarios.fechar();
        return;
    }

    // 2. Enviar comentário
    if (e.target.closest('#btn-enviar-comentario')) {
        window.secaoComentarios.enviar();
    }
});

// Enviar com a tecla "Enter"
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});

if (window.logVisual) window.logVisual("Módulo Comentários: OK.");
