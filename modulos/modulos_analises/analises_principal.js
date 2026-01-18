/**
 * modulos/modulos_analises/analises_principal.js
 * Ponto de entrada: Gerencia dados, Firebase e eventos globais
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// Configuração Firebase
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

// Estado da Aplicação
let todasAsNoticias = [];
let noticiasExibidasCount = 5;

/**
 * Expõe funções para o objeto window (compatibilidade com HTML onclick)
 */
window.analises = {
    copiarLink: Funcoes.copiarLink,
    compartilhar: Funcoes.compartilharNoticia,
    trocarVideo: Funcoes.trocarVideo,
    fecharModal: Funcoes.fecharModalPrincipal,
    toggleComentarios: Funcoes.toggleComentarios,
    carregarMais: () => {
        noticiasExibidasCount += 5;
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
    }
};

// Aliases para manter compatibilidade direta com nomes antigos se necessário
window.fecharModal = window.analises.fecharModal;
window.fecharComentarios = () => window.analises.toggleComentarios(false);

/**
 * Verifica se existe um ID na URL para abrir o modal automaticamente
 */
function verificarDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id && todasAsNoticias.length > 0) {
        const noticia = todasAsNoticias.find(n => n.id === id);
        if (noticia) Interface.abrirNoticiaEmModal(noticia);
    }
}

/**
 * Carrega o cabeçalho editorial personalizado do Firebase
 */
async function carregarBlocoEditorial() {
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        const container = document.getElementById('subcategorias-container');
        
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('capa-titulo').textContent = data.titulo?.trim();
            document.getElementById('capa-descricao').textContent = data.descricao?.trim();

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
 * Escuta mudanças no Firestore em tempo real
 */
function iniciarSyncNoticias() {
    const q = collection(db, "analises");
    onSnapshot(q, (snapshot) => {
        const noticiasFB = [];
        snapshot.forEach((doc) => {
            noticiasFB.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordena por data (mais recente primeiro)
        todasAsNoticias = noticiasFB.sort((a, b) => (b.data || 0) - (a.data || 0));
        
        Interface.renderizarNoticias(todasAsNoticias, noticiasExibidasCount);
        verificarDeepLink();
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarBlocoEditorial();
    iniciarSyncNoticias();
    
    // Vincula o botão "Carregar Mais"
    const btnMais = document.getElementById('btn-carregar-mais');
    if (btnMais) btnMais.onclick = window.analises.carregarMais;
});

