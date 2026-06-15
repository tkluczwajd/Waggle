// src/modules/community/postsRenderer.js
// 🛑 TEN PLIK ZOSTAŁ ZDEZAKTYWOWANY! 
// Całe renderowanie tablicy odbywa się teraz wyłącznie przez src/modules/board.js

export function renderPostsList(posts, filter) {
    // Celowo zostawiamy pustą funkcję. 
    // Dzięki temu router.js nie wyrzuci błędu, ale stary wygląd nie nadpisze naszej nowej Tablicy.
    console.warn("⚠️ Zablokowano próbę użycia starego renderera postsRenderer.js! Używamy board.js.");
}

export function renderCommentsList(comments) {
    // Pusta funkcja dla bezpieczeństwa importów
}

window.Waggle = window.Waggle || {};
window.Waggle.openLightbox = (imgUrl) => {
    // Zostawiamy funkcję powiększania zdjęć, gdyby gdzieś indziej w apce była używana
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgUrl;
        lightbox.style.display = 'flex';
    }
};
