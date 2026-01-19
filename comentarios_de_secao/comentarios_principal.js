/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * Ponto de entrada do módulo global de comentários
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// Configuração idêntica para manter a conexão com seu banco atual
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

// Objeto global para que outras partes do site chamem o sistema
window.secaoComentarios = {
    abrir: (id) => Funcoes.toggleComentarios(true, id),
    fechar: () => Funcoes.toggleComentarios(false)
};

// Configuração de ouvintes de eventos (Botão Fechar)
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-fechar-comentarios') {
        window.secaoComentarios.fechar();
    }
});

/**
 * Função futura: Aqui você poderá adicionar a lógica de 
 * carregar comentários reais do Firebase usando o idConteudo.
 */
console.log("[Módulo Comentários] Sistema global carregado e pronto.");
