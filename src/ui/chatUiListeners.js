import { searchUsers, sendMessage, loadInbox, handleChatImageSelect } from '../modules/chat/chatListeners.js';
import { appState as state } from '../core/state.js';

export function initChatUi() {
    // 1. Nasłuchiwacz wpisywania (wyszukiwanie użytkowników)
    document.addEventListener('input', (e) => { 
        if (e.target.id === 'userSearchInput' || e.target.id === 'chatSearchInput') {
            searchUsers(e.target.value); 
        }
    });

    // 2. Główny nasłuchiwacz kliknięć dla całego interfejsu czatu
    document.addEventListener('click', async (e) => {
        
        // Wymuszenie ładowania wiadomości po wejściu w zakładkę "Rozmowy" z dolnego menu
        const chatNavBtn = e.target.closest('[data-view="chat"]');
        if (chatNavBtn) {
            console.log("💬 Otwarto główną zakładkę Rozmowy - ładuję Inbox...");
            if (document.getElementById('inbox-container')) {
                loadInbox();
            }
        }
        
        // OBSŁUGA DODAWANIA ZDJĘĆ DO KOSZYKA
        if (e.target.closest('#chatAddPhotoBtn')) {
            if (window.Waggle && window.Waggle.selectPhotoSource) {
                // Odpalamy Twój autorski modal Aparat/Galeria
                window.Waggle.selectPhotoSource((file) => {
                    handleChatImageSelect([file]); 
                });
            } else {
                // Fallback, jeśli modala by nie było
                const input = document.getElementById('chatImageInput');
                if (input) input.click();
            }
        }
        
        // ZAKŁADKA STADO / SZUKAJ (Zachowane dla kompatybilności starych przycisków w UI)
        if (e.target.closest('#chatTabSearch')) {
            const inboxContainer = document.getElementById('inbox-container');
            const searchView = document.getElementById('chat-search-view');
            const listWrapper = document.getElementById('users-list-wrapper');
            
            if (inboxContainer) inboxContainer.style.display = 'none'; 
            if (searchView) searchView.style.display = 'block';
            if (listWrapper) listWrapper.style.display = 'block';
            
            const tabSearch = document.getElementById('chatTabSearch');
            const tabInbox = document.getElementById('chatTabInbox');
            
            if (tabSearch) {
                tabSearch.style.background = '#2d3436';
                tabSearch.style.color = '#ffffff';
            }
            if (tabInbox) {
                tabInbox.style.background = 'transparent';
                tabInbox.style.color = 'var(--text-muted)';
            }
            
            if(window.Waggle.executeSearch) window.Waggle.executeSearch(''); 
        }
        
        // ZAKŁADKA ROZMOWY (Zachowane dla kompatybilności starych przycisków w UI)
        if (e.target.closest('#chatTabInbox')) {
            const inboxContainer = document.getElementById('inbox-container');
            const searchView = document.getElementById('chat-search-view');
            const listWrapper = document.getElementById('users-list-wrapper');
            
            if (inboxContainer) inboxContainer.style.display = 'block'; 
            if (searchView) searchView.style.display = 'none';
            if (listWrapper) listWrapper.style.display = 'none';
            
            const tabSearch = document.getElementById('chatTabSearch');
            const tabInbox = document.getElementById('chatTabInbox');

            if (tabInbox) {
                tabInbox.style.background = '#2d3436';
                tabInbox.style.color = '#ffffff';
            }
            if (tabSearch) {
                tabSearch.style.background = 'transparent';
                tabSearch.style.color = 'var(--text-muted)';
            }
            
            loadInbox();
        }
        
        // WYSYŁANIE WIADOMOŚCI
        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput'); 
            const text = input ? input.value.trim() : "";
            
            // 🔥 Wywołujemy sendMessage. Funkcja w chatListeners.js sama sprawdzi 
            // czy są zdjęcia i wyśle je razem z tekstem.
            sendMessage(text); 
        }
    }); // <-- Zamknięcie głównego listenera click
}

// ============================================================================
// 🔥 GLOBALNE FUNKCJE WYWOŁUJĄCE INTERFEJS
// ============================================================================

// Funkcja przechwytująca kliknięcie "Napisz wiadomość" w nowej wizytówce
window.Waggle.startDirectChat = (uid, name, avatar) => {
    // 1. Ukrywamy kartę profilu, z której kliknięto
    const actionModal = document.getElementById('user-action-modal');
    if (actionModal) actionModal.style.display = 'none';
    
    // 2. Odpalamy oryginalny silnik czatu
    if (typeof window.Waggle.openChat === 'function') {
        window.Waggle.openChat(uid, name, avatar);
    } else {
        console.warn("Nie znaleziono globalnej funkcji openChat. Próba ręcznego otwarcia...");
        // Awaryjne otwarcie okna czatu, gdyby silnik był niezainicjowany
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            const nameField = document.getElementById('chatPartnerName');
            if (nameField) nameField.innerText = name;
            chatWindow.style.display = 'flex';
        }
    }
};

// Globalna funkcja otwierająca okno z konkretnym obrazkiem na pełen ekran (Lightbox)
window.Waggle.openLightbox = (url) => {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = url;
        modal.style.display = 'flex';
    }
};

// Jeśli potrzebujesz otworzyć pustą Skrzynkę z zewnątrz np. po kliknięciu ikonki z dzwoneczkiem:
window.Waggle.openInbox = () => {
    // Wywołuje kliknięcie na ukrytą lub nową zakładkę czatu w dolnym menu
    const chatTab = document.querySelector('[data-view="chat"]');
    if (chatTab) chatTab.click();
};
// Otwiera modal z akcjami dla konkretnego użytkownika (klikniętego na Tablicy lub Mapie)
window.Waggle.showUserActionModal = (uid, name, avatar) => {
    const modal = document.getElementById('user-action-modal');
    if (modal) {
        document.getElementById('actionUserName').innerText = name || "Piesek";
        document.getElementById('actionUserAvatar').src = avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        
        // Podpinamy przycisk czatu pod tego konkretnego użytkownika
        const msgBtn = document.getElementById('actionMsgBtn');
        msgBtn.onclick = () => window.Waggle.startDirectChat(uid, name, avatar);
        
        modal.style.display = 'flex';
    }
};
