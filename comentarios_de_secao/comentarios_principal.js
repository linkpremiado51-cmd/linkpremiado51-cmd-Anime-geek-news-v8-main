/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * ESTRATÉGIA: Integração com Visual Premium e Controle de Classe .active
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
 * Carrega comentários em tempo real
 */
async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
        if (window.logVisual) window.logVisual(`${comentarios.length} comentários carregados.`);
    }, (error) => {
        console.error("Erro Firebase:", error);
    });
}

/**
 * API Global do Módulo
 */
const apiComentarios = {
    abrir: (id) => {
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            modal.style.display = 'flex'; // Exibe o container
            setTimeout(() => modal.classList.add('active'), 10); // Dispara animação CSS
            document.body.style.overflow = 'hidden'; // Trava o scroll da página
            
            idConteudoAtual = id;
            carregarComentariosRealTime(id);
            if (window.logVisual) window.logVisual("Discussão aberta.");
        }
    },
    fechar: () => {
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            modal.classList.remove('active'); // Inicia animação de saída
            document.body.style.overflow = 'auto'; // Libera o scroll
            
            // Espera a animação do CSS (0.4s) terminar para esconder
            setTimeout(() => {
                if (!modal.classList.contains('active')) {
                    modal.style.display = 'none';
                }
            }, 400);

            if (unsubscribeAtual) unsubscribeAtual();
            idConteudoAtual = null;
        }
    },
    enviar: async () => {
        const input = document.getElementById('input-novo-comentario');
        if (!input || !input.value.trim() || !idConteudoAtual) return;

        const texto = input.value.trim();
        input.value = ""; 

        try {
            const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
            await addDoc(colRef, {
                autor: "Leitor Geek",
                texto: texto,
                data: serverTimestamp()
            });
        } catch (error) {
            if (window.logVisual) window.logVisual("Erro ao enviar.");
        }
    }
};

window.secaoComentarios = apiComentarios;

// --- GESTÃO DE CLIQUES ---
document.addEventListener('click', (e) => {
    // Fechar pelo botão X ou clicando no fundo escuro (overlay)
    const isBotaoFechar = e.target.closest('#btn-fechar-comentarios');
    const isFundoEscuro = e.target.classList.contains('modal-comentarios-overlay');

    if (isBotaoFechar || isFundoEscuro) {
        window.secaoComentarios.fechar();
        return;
    }

    // Botão de Enviar
    if (e.target.closest('#btn-enviar-comentario')) {
        window.secaoComentarios.enviar();
    }
});

// Enviar com Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});
