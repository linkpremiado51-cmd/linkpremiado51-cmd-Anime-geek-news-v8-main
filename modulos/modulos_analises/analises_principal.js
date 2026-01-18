/**
 * modulos/modulos_analises/analises_principal.js
 * Correção: Filtro de coleção e persistência de eventos do botão
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

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

let todasAsNoticias = [];
let noticiasExibidasCount = 5;

window.analises = {
    copiarLink: Funcoes.copiarLink,
    compartilhar: Funcoes.compartilharNoticia,
    trocarVideo: Funcoes.trocarVideo,
    toggleComentarios: Funcoes.toggleComentarios,
    
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsNoticias.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia(noticia);
        }
    },

    carregarMais: () => {
        noticiasExibidasCount += 5;
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
        // Re-vincula após renderizar para garantir que o botão atualizado funcione
        vincularEventosInterface();
    }
};

async function carregarBlocoEditorial() {
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        const container = document.getElementById('subcategorias-container');
        if (!container) return; 

        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            const descEl = document.getElementById('capa-descricao');
            
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises Profundas";
            if (descEl) descEl.textContent = data.descricao || "";

            if (data.subcategorias) {
                container.innerHTML = data.subcategorias.map(tag => 
                    `<span class="subcat-tag">${tag}</span>`
                ).join('');
            }
        }
    } catch (error) { console.error("Erro editorial:", error); }
}

function iniciarSyncNoticias() {
    // query explícita para garantir que pegamos APENAS a coleção 'analises'
    const q = query(collection(db, "analises"), orderBy("data", "desc"));
    
    onSnapshot(q, (snapshot) => {
        todasAsNoticias = []; // Limpa para evitar duplicatas de outras execuções
        snapshot.forEach((doc) => {
            todasAsNoticias.push({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data() 
            });
        });
        
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
        vincularEventosInterface();
    });
}

/**
 * Função de segurança para garantir que o botão de carregar mais
 * sempre funcione, mesmo após o fetch do HTML.
 */
function vincularEventosInterface() {
    const btnMais = document.getElementById('btn-carregar-mais');
    if (btnMais) {
        btnMais.onclick = (e) => {
            e.preventDefault();
            window.analises.carregarMais();
        };
    }
}

// Inicialização com atraso curto para garantir que o DOM injetado via fetch esteja pronto
setTimeout(() => {
    carregarBlocoEditorial();
    iniciarSyncNoticias();
}, 100);
