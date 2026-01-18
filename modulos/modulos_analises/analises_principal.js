/**
 * modulos/modulos_analises/analises_principal.js
 * Novo Sistema de Paginação Independente
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

    // Nova função de carregar mais independente
    carregarMaisNovo: () => {
        noticiasExibidasCount += 5;
        atualizarInterface();
    }
};

function atualizarInterface() {
    // Renderiza a lista
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    
    // Injeta o NOVO botão se houver mais conteúdo
    const container = document.getElementById('container-principal');
    if (todasAsAnalisesLocais.length > noticiasExibidasCount) {
        const btnHtml = `
            <div id="novo-pagination-modulo" style="text-align: center; padding: 40px 0;">
                <button class="btn-paginacao-geek" onclick="window.analises.carregarMaisNovo()">
                    <i class="fa-solid fa-plus"></i> Carregar Mais Análises
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', btnHtml);
    }
}

function iniciarSyncNoticias() {
    onSnapshot(collection(db, "analises"), (snapshot) => {
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => ({ id: doc.id, origem: 'analises', ...doc.data() }))
            .sort((a, b) => (new Date(b.lastUpdate || 0)) - (new Date(a.lastUpdate || 0)));
        
        atualizarInterface();
    });
}

// Inicialização
iniciarSyncNoticias();
