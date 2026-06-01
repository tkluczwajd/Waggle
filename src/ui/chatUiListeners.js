import { searchUsers, sendMessage, loadInbox, handleChatImageSelect } from '../modules/chat/chatListeners.js';
import { appState as state } from '../core/state.js';

export function initChatUi() {
    document.addEventListener('input', (e) => { 
        if (e.target.id === 'userSearchInput' || e.target.id === 'chatSearchInput') searchUsers(e.target.value); 
    });

    document.addEventListener('click', async (e) => {
        
        // 1. OBSŁUGA DODAWANIA ZDJĘĆ DO KOSZYKA
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
        
        // 2. ZAKŁADKA STADO / SZUKAJ (Zachowane dla kompatybilności)
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
        
        // 3. ZAKŁADKA ROZMOWY (Zachowane dla kompatybilności)
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
        
        // 4. WYSYŁANIE WIADOMOŚCI
        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput'); 
            const text = input ? input.value.trim() : "";
            
            // 🔥 Po prostu wywołujemy sendMessage. Nasza funkcja w chatListeners.js 
            // sama zorientuje się, że są zdjęcia w koszyku i wyśle je z tekstem!
            sendMessage(text); 
        }
    });
}

// ============================================================================
// 🔥 NOWE FUNKCJE WYWOŁUJĄCE PRAWDZIWY CZAT (Zamiast sztucznych okienek)
// ============================================================================

// Globalna funkcja otwierająca okno Inboxa z górnego paska
window.Waggle.openInbox = () => {
    const inboxModal = document.getElementById('inbox-modal');
    if (inboxModal) {
        inboxModal.style.display = 'flex';
        // Automatycznie wymuszamy załadowanie wiadomości z bazy
        loadInbox(); 
    }
};

// Funkcja przechwytująca kliknięcie "Napisz wiadomość" w nowej wizytówce
window.Waggle.startDirectChat = (uid, name, avatar) => {
    // 1. Ukrywamy kartę profilu
    const actionModal = document.getElementById('user-action-modal');
    if (actionModal) actionModal.style.display = 'none';
    
    // 2. Odpalamy Twój oryginalny silnik czatu
    if (typeof window.Waggle.openChat === 'function') {
        window.Waggle.openChat(uid, name, avatar);
    } else {
        console.warn("Nie znaleziono globalnej funkcji openChat. Próba ręcznego otwarcia...");
        // Awaryjne, bezpośrednie otwarcie okna czatu w razie gdyby funkcja nie była podpięta
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            document.getElementById('chatPartnerName').innerText = name;
            chatWindow.style.display = 'flex';
        }
    }
};
