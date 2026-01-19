/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * Ponto de entrada do módulo global de comentários com Logs Visuais
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// Injeta o HTML e CSS assim que o módulo é importado
Interface.injetarEstruturaModal();

let unsubscribeAtual = null; // Para limpar a conexão anterior ao trocar de notícia

/**
 * Função para carregar comentários em tempo real do Firebase
 */
async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual(); // Para de ouvir a notícia anterior

    window.logVisual(`Conectando mensagens de: ${idConteudo}`);
    
    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.logVisual(`${comentarios.length} comentários recebidos.`);
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        window.logVisual("Erro ao ler comentários.");
        console.error(error);
    });
}

// Objeto global para que outras partes do site chamem o sistema
window.secaoComentarios = {
    abrir: (id) => {
        window.logVisual(`Abrindo comentários: ${id}`);
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        window.logVisual("Fechando seção de comentários.");
        if (unsubscribeAtual) unsubscribeAtual();
        Funcoes.toggleComentarios(false);
    }
};

// Configuração de ouvintes de eventos (Botão Fechar e Clique Fora)
document.addEventListener('click', (e) => {
    // Fecha no "X" ou se clicar no fundo escuro (overlay)
    if (e.target.classList.contains('btn-geek-close') || e.target.classList.contains('modal-geek-overlay')) {
        window.secaoComentarios.fechar();
    }
});

window.logVisual("Módulo Comentários: OK.");
