/**
 * modulos/modulos_analises/analises_principal.js
 * Editado para integração total com AniGeekNews SPA
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// Reutilizamos a config do Firebase (Poderia vir do config-firebase.js global também)
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

/**
 * Expõe para o window usando o namespace 'analises'
 * Agora integrado com o Modal Global do seu modal-manager.js
 */
window.analises = {
    copiarLink: Funcoes.copiarLink,
    compartilhar: Funcoes.compartilharNoticia,
    trocarVideo: Funcoes.trocarVideo,
    
    // Agora chama o modal global do seu sistema
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsNoticias.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia(noticia);
        }
    },

    carregarMais: () => {
        noticiasExibidasCount += 5;
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
    }
};

/**
 * Carrega o cabeçalho editorial personalizado
 */
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
            
            if (tituloEl) tituloEl.textContent = data.titulo?.trim();
            if (descEl) descEl.textContent = data.descricao?.trim();

            if (data.subcategorias) {
                container.innerHTML = data.subcategorias.map(tag => 
                    `<span class="subcat-tag">${tag}</span>`
                ).join('');
            }
        }
    } catch (error) {
        console.error("Erro editorial:", error);
    }
}

/**
 * Escuta mudanças no Firestore (Coleção: analises)
 */
function iniciarSyncNoticias() {
    const q = collection(db, "analises");
    onSnapshot(q, (snapshot) => {
        const noticiasFB = [];
        snapshot.forEach((doc) => {
            // Normalização básica para garantir que o modal global entenda a origem
            const data = doc.data();
            noticiasFB.push({ 
                id: doc.id, 
                origem: 'analises', // Importante para o seu modal-manager.js
                ...data 
            });
        });
        
        todasAsNoticias = noticiasFB.sort((a, b) => (b.data || 0) - (a.data || 0));
        
        // Renderiza na seção 'analises.html'
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
    });
}

// INICIALIZAÇÃO IMEDIATA (Essencial para o seu sistema de fetch)
carregarBlocoEditorial();
iniciarSyncNoticias();

// Vincula o botão "Carregar Mais" se ele existir no DOM
const btnMais = document.getElementById('btn-carregar-mais');
if (btnMais) {
    btnMais.onclick = () => window.analises.carregarMais();
}
