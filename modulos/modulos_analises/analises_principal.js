/**
 * modulos/modulos_analises/analises_principal.js
 * Ajuste: Garantindo a coleção correta e lógica de carregamento
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// Configuração extraída do seu sistema
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

// Variáveis de controle de estado
let todasAsNoticias = [];
let noticiasExibidasCount = 5; // Começa mostrando 5

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

    // ESTA FUNÇÃO É O QUE O BOTÃO CLICA
    carregarMais: () => {
        noticiasExibidasCount += 5; // Aumenta o limite
        // Re-renderiza a mesma lista, mas com o novo limite
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
            
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
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
    // APONTANDO DIRETAMENTE PARA A COLEÇÃO 'analises'
    const colRef = collection(db, "analises");
    
    onSnapshot(colRef, (snapshot) => {
        const noticiasFB = [];
        snapshot.forEach((doc) => {
            const dados = doc.data();
            noticiasFB.push({ 
                id: doc.id, 
                origem: 'analises', // Define a origem correta para o navegador
                ...dados 
            });
        });
        
        // Ordenação por lastUpdate (visto no seu print do Firebase)
        todasAsNoticias = noticiasFB.sort((a, b) => {
            const dataA = a.lastUpdate ? new Date(a.lastUpdate) : 0;
            const dataB = b.lastUpdate ? new Date(b.lastUpdate) : 0;
            return dataB - dataA;
        });
        
        // Primeira renderização com o limite inicial (5)
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
        vincularEventosInterface();
    });
}

function vincularEventosInterface() {
    const btnMais = document.getElementById('btn-carregar-mais');
    if (btnMais) {
        // Remove ouvintes antigos para não duplicar o clique
        btnMais.onclick = null;
        btnMais.onclick = (e) => {
            e.preventDefault();
            window.analises.carregarMais();
        };
    }
}

// Inicialização
carregarBlocoEditorial();
iniciarSyncNoticias();
