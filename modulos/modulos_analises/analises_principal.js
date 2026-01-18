/**
 * modulos/modulos_analises/analises_principal.js
 * Correção: Busca simplificada para garantir exibição das notícias
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
    // Busca a coleção sem query restritiva para garantir que os dados cheguem
    const colRef = collection(db, "analises");
    
    onSnapshot(colRef, (snapshot) => {
        const noticiasFB = [];
        snapshot.forEach((doc) => {
            noticiasFB.push({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data() 
            });
        });
        
        // Ordenação manual para evitar erro de índice do Firebase
        todasAsNoticias = noticiasFB.sort((a, b) => {
            const dataA = a.data || 0;
            const dataB = b.data || 0;
            return dataB - dataA;
        });
        
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
        vincularEventosInterface();
    });
}

function vincularEventosInterface() {
    const btnMais = document.getElementById('btn-carregar-mais');
    if (btnMais) {
        btnMais.onclick = (e) => {
            e.preventDefault();
            window.analises.carregarMais();
        };
    }
}

// Inicialização imediata
carregarBlocoEditorial();
iniciarSyncNoticias();
