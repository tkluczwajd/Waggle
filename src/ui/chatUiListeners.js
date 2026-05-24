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
                    // Zamiast starego przypisania, wrzucamy plik prosto do naszego nowego KOSZYKA
                    handleChatImageSelect([file]); 
                });
            } else {
                // Fallback, jeśli modala by nie było
                const input = document.getElementById('chatImageInput');
                if (input) input.click();
            }
        }
        
        // 2. ZAKŁADKA STADO / SZUKAJ
        if (e.target.closest('#chatTabSearch')) {
            document.getElementById('inbox-container').style.display = 'none'; 
            document.getElementById('chat-search-view').style.display = 'block';
            
            // Pokazujemy nową, przewijaną listę wyników
            const listWrapper = document.getElementById('users-list-wrapper');
            if(listWrapper) listWrapper.style.display = 'block';
            
            document.getElementById('chatTabSearch').style.background = '#2d3436';
            document.getElementById('chatTabSearch').style.color = '#ffffff';
            document.getElementById('chatTabInbox').style.background = 'transparent';
            document.getElementById('chatTabInbox').style.color = 'var(--text-muted)';
            
            if(window.Waggle.executeSearch) window.Waggle.executeSearch(''); 
        }
        
        // 3. ZAKŁADKA ROZMOWY
        if (e.target.closest('#chatTabInbox')) {
            document.getElementById('inbox-container').style.display = 'block'; 
            document.getElementById('chat-search-view').style.display = 'none';
            
            // Ukrywamy listę wyników
            const listWrapper = document.getElementById('users-list-wrapper');
            if(listWrapper) listWrapper.style.display = 'none';
            
            document.getElementById('chatTabInbox').style.background = '#2d3436';
            document.getElementById('chatTabInbox').style.color = '#ffffff';
            document.getElementById('chatTabSearch').style.background = 'transparent';
            document.getElementById('chatTabSearch').style.color = 'var(--text-muted)';
            
            loadInbox();
        }
        
        // 4. WYSYŁANIE WIADOMOŚCI
        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput'); 
            const text = input ? input.value.trim() : "";
            
            // 🔥 NOWOŚĆ: Po prostu wywołujemy sendMessage. Nasza nowa funkcja 
            // w chatListeners.js sama zorientuje się, że są zdjęcia w koszyku 
            // i wyśle zarówno tekst, jak i po kolei wszystkie fotki!
            sendMessage(text); 
        }
    });
}
