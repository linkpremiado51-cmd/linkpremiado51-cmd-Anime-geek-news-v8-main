/**
 * modulos/modulos_analises/analises_principal.js
 * Ajuste: Modularização com normalização de dados (estilo sistema antigo)
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

// Lista local exclusiva para este módulo (evita misturar com window.noticiasFirebase)
let todasAsAnalisesLocais = []; 
let noticiasExibidasCount = 5;

/**
 * Imita a lógica de normalização do sistema antigo (config-firebase.js)
 * Garante que vídeos e imagens funcionem no novo formato modular.
 */
function normalizarParaAnalise(docSnapshot) {
    const data = docSnapshot.data();
    
    // Formatação do Vídeo Principal (Lógica do sistema antigo)
    let videoUrl = data.videoPrincipal || "";
    if (videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&modestbranding=1";
    }

    return {
        id: docSnapshot.id,
        origem: 'analises', // Força a origem para não misturar coleções
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
        Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
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
    const colRef = collection(db, "analises");
    
    onSnapshot(colRef, (snapshot) => {
        // Mapeia usando a nova função de normalização baseada no seu config-firebase antigo
        todasAsAnalisesLocais = snapshot.docs
            .map(doc => normalizarParaAnalise(doc))
            .sort((a, b) => {
                const dataA = a.lastUpdate ? new Date(a.lastUpdate) : 0;
                const dataB = b.lastUpdate ? new Date(b.lastUpdate) : 0;
                return dataB - dataA;
            });
        
        // Renderiza apenas o que foi filtrado e normalizado localmente
        Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
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

carregarBlocoEditorial();
iniciarSyncNoticias();
