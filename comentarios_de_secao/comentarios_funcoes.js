/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * Lógica de controle e persistência de comentários
 */

import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Controla a exibição do modal de comentários
 */
export function toggleComentarios(abrir = true, idConteudo = null) {
    const modal = document.getElementById('modal-comentarios-global');
    if (!modal) {
        console.warn("Funções: Modal de comentários não encontrado no DOM.");
        return;
    }

    if (abrir) {
        // Garante que o ID da notícia está vinculado ao modal
        if (idConteudo) {
            modal.dataset.idAtual = idConteudo;
        }

        modal.style.display = 'flex';
        
        // Força o navegador a processar o display:flex antes da animação
        void modal.offsetWidth; 

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Trava o scroll do fundo

        if (window.logVisual) window.logVisual(`Interface: Modal aberto para ${idConteudo}`);
    } else {
        modal.classList.remove('active');
        
        // Aguarda a transição do CSS (300ms) para esconder o display
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.dataset.idAtual = ""; // Limpa o ID por segurança
            }
        }, 300);
        
        document.body.style.overflow = 'auto';
        if (window.logVisual) window.logVisual("Interface: Modal fechado.");
    }
}

/**
 * Envia um novo comentário para o Firestore
 */
export async function enviarNovoComentario(db, idConteudo, texto) {
    if (!texto || !texto.trim()) return;

    if (window.logVisual) window.logVisual("Enviando comentário...");

    try {
        const colRef = collection(db, "analises", idConteudo, "comentarios");
        await addDoc(colRef, {
            nome: "Usuário Geek", // Futuro: integrar com Auth
            texto: texto.trim(),
            data: serverTimestamp()
        });

        if (window.logVisual) window.logVisual("Sucesso ao comentar!");
        limparCampoInput();
    } catch (error) {
        if (window.logVisual) window.logVisual("Erro ao salvar comentário.");
        console.error("Erro Firebase:", error);
    }
}

/**
 * Limpa o campo de texto após o envio
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        input.focus();
    }
}
