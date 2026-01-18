/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * Sistema de Paginação com Delegamento de Eventos (Blindagem contra Race Conditions)
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

// Objeto Global para funções acessíveis via HTML/Console
window.analises = {
    ...Funcoes,
    
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) window.abrirModalNoticia(noticia);
    },

    /**
     * Incrementa o contador de exibição.
     */
    carregarMaisNovo: () => {
        noticiasExibidasCount += 5;
        atualizarInterface();
    }
};

/**
 * SOLUÇÃO DE DELEGAMENTO (Blindagem Total):
 * Escuta cliques no documento inteiro. Se o alvo for o nosso botão, executa a função.
 * Isso sobrevive mesmo se o navegacao.js destruir e recriar o DOM.
 */
document.addEventListener('click', (e) => {
    const target = e.target.closest('#btn-carregar-mais');
    if (target) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }
});

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
 * Renderiza as notícias e gerencia o botão de paginação
 */
function atualizarInterface() {
    // 1. Renderiza os cards
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    
    // 2. Lógica de exibição do botão
    const temMaisParaCarregar = todasAsAnalisesLocais.length > noticiasExibidasCount;
    const btnContainer = document.getElementById('novo-pagination-modulo');

    if (temMaisParaCarregar) {
        // Chamamos a interface apenas para injetar o HTML do botão no placeholder
        Interface.renderizarBotaoPaginacao(); 
    } else {
        // Se não tem mais nada, limpa o placeholder
        if (btnContainer) btnContainer.innerHTML = '';
    }
}

/**
 * Sincroniza em tempo real com o Firebase
 */
function iniciarSyncNoticias() {
    onSnapshot(collection(db, "analises"), (snapshot) => {
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => ({ 
                id: doc.id, 
                origem: 'analises', 
                ...doc.data(),
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

// Inicialização do sistema
carregarBlocoEditorial();
iniciarSyncNoticias();
