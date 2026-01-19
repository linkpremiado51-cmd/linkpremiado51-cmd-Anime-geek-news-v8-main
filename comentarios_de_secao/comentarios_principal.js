/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * Ponto de entrada do módulo global de comentários com Logs Visuais
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// Injeta a estrutura apenas quando o DOM estiver pronto para evitar erros de container ausente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Interface.injetarEstruturaModal());
} else {
    Interface.injetarEstruturaModal();
}

let unsubscribeAtual = null;

/**
 * Função para carregar comentários em tempo real do Firebase
 */
async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();

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

// DEFINIÇÃO GLOBAL REFORÇADA
// Isso garante que o analises_principal.js e os botões no HTML enxerguem as funções
const apiComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`Solicitando abertura: ${id}`);
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("Solicitando fechamento.");
        if (unsubscribeAtual) unsubscribeAtual();
        Funcoes.toggleComentarios(false);
    }
};

window.secaoComentarios = apiComentarios;

// Ouvintes de eventos para fechar o modal
document.addEventListener('click', (e) => {
    // Verifica se clicou no botão de fechar (X) ou no overlay (fundo escuro)
    const clicouNoX = e.target.closest('.btn-close-comentarios') || e.target.id === 'btn-fechar-comentarios';
    const clicouNoFundo = e.target.classList.contains('modal-comentarios-overlay');

    if (clicouNoX || clicouNoFundo) {
        window.secaoComentarios.fechar();
    }
});

if (window.logVisual) window.logVisual("Módulo Comentários: OK.");
