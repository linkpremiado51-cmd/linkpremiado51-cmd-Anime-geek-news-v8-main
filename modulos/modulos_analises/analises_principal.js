/**
 * modulos/modulos_analises/analises_principal.js
 * Sistema de Paginação Dinâmico e Independente
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

let todasAsAnalisesLocais = [];
let noticiasExibidasCount = 5;

window.analises = {
    ...Funcoes,
    
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) window.abrirModalNoticia(noticia);
    },

    /**
     * Incrementa o contador de exibição de 5 em 5.
     */
    carregarMaisNovo: () => {
        noticiasExibidasCount += 5;
        atualizarInterface();
    }
};

/**
 * Carrega o bloco editorial (título e descrição da capa)
 */
async function carregarBlocoEditorial() {
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        if (snap.exists()) {
            const data = snap.data();
            const tituloEl = document.getElementById('capa-titulo');
            const descEl = document.getElementById('capa-descricao');
            const containerTags = document.getElementById('subcategorias-container');
            
            if (tituloEl) tituloEl.textContent = data.titulo || "Análises";
            if (descEl) descEl.textContent = data.descricao || "";
            if (containerTags && data.subcategorias) {
                containerTags.innerHTML = data.subcategorias.map(tag => 
                    `<span class="subcat-tag">${tag}</span>`
                ).join('');
            }
        }
    } catch (error) { 
        console.error("Erro editorial:", error); 
    }
}

/**
 * Renderiza as notícias e gerencia o botão de paginação através da Interface
 */
function atualizarInterface() {
    // 1. Renderiza os cards no container principal
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    
    // 2. Gerencia a exibição do botão de paginação
    const temMaisParaCarregar = todasAsAnalisesLocais.length > noticiasExibidasCount;

    if (temMaisParaCarregar) {
        // Usa a função robusta do analises_interface.js
        Interface.renderizarBotaoPaginacao(() => window.analises.carregarMaisNovo());
    } else {
        // Remove o botão caso não haja mais itens
        const btnContainer = document.getElementById('novo-pagination-modulo');
        if (btnContainer) btnContainer.remove();
    }
}

/**
 * Sincroniza em tempo real com a coleção específica de "analises"
 */
function iniciarSyncNoticias() {
    onSnapshot(collection(db, "analises"), (snapshot) => {
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => ({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data(),
                // Garante que o link do YouTube seja compatível com iframe
                videoPrincipal: doc.data().videoPrincipal?.replace("watch?v=", "embed/") || ""
            }))
            .sort((a, b) => {
                const dataA = a.lastUpdate ? new Date(a.lastUpdate) : 0;
                const dataB = b.lastUpdate ? new Date(b.lastUpdate) : 0;
                return dataB - dataA;
            });
        
        atualizarInterface();
    });
}

// Inicialização
carregarBlocoEditorial();
iniciarSyncNoticias();
