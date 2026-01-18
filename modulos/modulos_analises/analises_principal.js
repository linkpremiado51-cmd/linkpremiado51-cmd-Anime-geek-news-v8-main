/**
 * modulos/modulos_analises/analises_principal.js
 * Ajuste: Garantindo isolamento da coleção e visibilidade do botão de paginação
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

// Lista local e exclusiva para evitar conflitos com o sistema antigo
let todasAsAnalisesLocais = [];
let noticiasExibidasCount = 5;

/**
 * Normalização seguindo o padrão que você tinha no config-firebase.js
 */
function normalizarDocumento(docSnap) {
    const data = docSnap.data();
    let videoUrl = data.videoPrincipal || "";
    
    // Tratamento de link do YouTube (Sistema Antigo)
    if (videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1";
    }

    return {
        id: docSnap.id,
        origem: 'analises',
        ...data,
        videoPrincipal: videoUrl
    };
}

window.analises = {
    copiarLink: Funcoes.copiarLink,
    compartilhar: Funcoes.compartilharNoticia,
    trocarVideo: Funcoes.trocarVideo,
    toggleComentarios: Funcoes.toggleComentarios,
    
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia(noticia);
        }
    },

    carregarMais: () => {
        noticiasExibidasCount += 5;
        // Renderiza novamente com o novo limite
        Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
        // Re-vincula o evento no botão que foi re-renderizado ou atualizado
        vincularEventosInterface();
    }
};

async function carregarBlocoEditorial() {
    const blocoRef = doc(db, "sobre_nos", "analises_bloco_1");
    try {
        const snap = await getDoc(blocoRef);
        const container = document.getElementById('subcategorias-container');
        if (!container || !snap.exists()) return; 

        const data = snap.data();
        document.getElementById('capa-titulo').textContent = data.titulo || "Análises";
        document.getElementById('capa-descricao').textContent = data.descricao || "";

        if (data.subcategorias) {
            container.innerHTML = data.subcategorias.map(tag => 
                `<span class="subcat-tag">${tag}</span>`
            ).join('');
        }
    } catch (error) { console.error("Erro editorial:", error); }
}

function iniciarSyncNoticias() {
    // Alvo estrito na coleção de análises
    const colRef = collection(db, "analises");
    
    onSnapshot(colRef, (snapshot) => {
        // Filtramos e normalizamos aqui para garantir que nada de fora entre
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => normalizarDocumento(doc))
            .sort((a, b) => {
                const dataA = a.lastUpdate ? new Date(a.lastUpdate) : 0;
                const dataB = b.lastUpdate ? new Date(b.lastUpdate) : 0;
                return dataB - dataA;
            });
        
        Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
        vincularEventosInterface();
    });
}

function vincularEventosInterface() {
    const btnMais = document.getElementById('btn-carregar-mais');
    const wrapper = document.getElementById('pagination-control');

    // Força a visibilidade do wrapper se houver mais itens que o limite
    if (wrapper) {
        if (todasAsAnalisesLocais.length > noticiasExibidasCount) {
            wrapper.style.display = 'block';
        } else {
            wrapper.style.display = 'none';
        }
    }

    if (btnMais) {
        btnMais.onclick = null; // Limpa duplicatas
        btnMais.onclick = (e) => {
            e.preventDefault();
            window.analises.carregarMais();
        };
    }
}

carregarBlocoEditorial();
iniciarSyncNoticias();
