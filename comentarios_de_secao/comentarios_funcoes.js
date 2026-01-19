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
    if (!modal) return;

    if (abrir) {
        modal.style.display = 'flex';
        // Delay para animação CSS
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';

        if (idConteudo) {
            // Armazena o ID atual no modal para sabermos onde salvar o comentário depois
            modal.dataset.idAtual = idConteudo;
            if (window.logVisual) window.logVisual(`Discussão ativa: ${idConteudo}`);
        }
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
}

/**
 * Envia um novo comentário para o Firestore
 */
export async function enviarNovoComentario(db, idConteudo, texto) {
    if (!texto.trim()) return;

    if (window.logVisual) window.logVisual("Enviando comentário...");

    try {
        const colRef = collection(db, "analises", idConteudo, "comentarios");
        await addDoc(colRef, {
            nome: "Usuário Geek", // Aqui depois podemos integrar com sistema de login
            texto: texto.trim(),
            data: serverTimestamp()
        });

        if (window.logVisual) window.logVisual("Comentário enviado!");
        limparCampoInput();
    } catch (error) {
        if (window.logVisual) window.logVisual("Erro ao enviar mensagem.");
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
