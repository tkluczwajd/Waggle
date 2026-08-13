// src/ui/chatUiListeners.js
import { searchUsers, sendMessage, loadInbox, handleChatImageSelect } from '../modules/chat/chatListeners.js';
import { appState as state } from '../core/state.js';
import { mapManager } from '../modules/map/mapManager.js'; // 🔥 DODANY IMPORT MAPY
// 🔥 DODANY IMPORT DO USUWANIA WIADOMOŚCI
import { deleteChatMessage } from '../services/chatService.js';

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
                // Odpalamy autorski modal Aparat/Galeria
                window.Waggle.selectPhotoSource((file) => {
                    handleChatImageSelect([file]); 
                });
            } else {
                // Fallback, jeśli modala by nie było
                const input = document.getElementById('chatImageInput');
                if (input) input.click();
            }
        }
        
        // ZAKŁADKA STADO / SZUKAJ
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
        
        // ZAKŁADKA ROZMOWY
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
            sendMessage(text); 
        }
    }); 
}

// ============================================================================
// 🔥 GLOBALNE FUNKCJE WYWOŁUJĄCE INTERFEJS
// ============================================================================

// Funkcja przechwytująca kliknięcie "Napisz wiadomość"
window.Waggle.startDirectChat = (uid, name, avatar) => {
    const actionModal = document.getElementById('user-action-modal');
    if (actionModal) actionModal.style.display = 'none';
    
    if (typeof window.Waggle.openChat === 'function') {
        window.Waggle.openChat(uid, name, avatar);
    } else {
        console.warn("Nie znaleziono globalnej funkcji openChat. Próba ręcznego otwarcia...");
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            const nameField = document.getElementById('chatPartnerName');
            if (nameField) nameField.innerText = name;
            chatWindow.style.display = 'flex';
        }
    }
};

window.Waggle.openLightbox = (url) => {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = url;
        modal.style.display = 'flex';
    }
};

window.Waggle.openInbox = () => {
    const chatTab = document.querySelector('[data-view="chat"]');
    if (chatTab) chatTab.click();
};

// 🔥 NOWA FUNKCJA: Usuwanie wiadomości z czatu (zabezpieczone alertem)
window.Waggle.deleteChatMessage = (chatId, msgId) => {
    if (confirm("Czy na pewno chcesz usunąć tę wiadomość?")) {
        deleteChatMessage(chatId, msgId);
    }
};

// 🔥 NAPRAWIONA FUNKCJA Z PRAWIDŁOWYM ODLOTEM (flyTo) KAMERY
window.Waggle.showUserActionModal = (uid, name, avatar, lat = null, lng = null) => {
    const modal = document.getElementById('user-action-modal');
    if (modal) {
        document.getElementById('actionUserName').innerText = name || "Piesek";
        document.getElementById('actionUserAvatar').src = avatar || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
        
        const msgBtn = document.getElementById('actionMsgBtn');
        msgBtn.onclick = () => window.Waggle.startDirectChat(uid, name, avatar);
        
        const mapBtn = document.getElementById('actionMapBtn');
        if (lat !== null && lng !== null && lat !== undefined && lng !== undefined) {
            mapBtn.style.display = 'block';
            mapBtn.onclick = () => {
                modal.style.display = 'none'; // Ukryj wizytówkę
                
                // Przejdź na mapę
                const mapTab = document.querySelector('.bottom-nav [data-view="local"]');
                if (mapTab) {
                    mapTab.click();
                } else if (typeof window.Waggle.navigate === 'function') {
                    window.Waggle.navigate('local');
                }

                // Dajemy czas na przełączenie i odpalamy mapManagera
                setTimeout(() => {
                    const parsedLat = parseFloat(lat);
                    const parsedLng = parseFloat(lng);
                    
                    if (mapManager && typeof mapManager.flyTo === 'function') {
                        // Zoom 17 to ładne zbliżenie na psa
                        mapManager.flyTo(parsedLat, parsedLng, 17);
                    } else {
                        console.error("Błąd: Moduł mapManager nie został poprawnie zaimportowany.");
                    }
                }, 400); 
            };
        } else {
            mapBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
    }
};
