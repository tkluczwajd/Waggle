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
// src/ui/chatUiListeners.js (dodaj na końcu pliku)

// Globalna funkcja otwierająca okno czatu z konkretnym psem
window.Waggle.openChat = (uid, name, avatar) => {
    let chatModal = document.getElementById('dynamic-chat-modal');
    
    // Jeśli kontener czatu nie istnieje w HTML, budujemy go w locie
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'dynamic-chat-modal';
        chatModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg-color, #f4f6f9); z-index:999999; display:none; flex-direction:column;";
        document.body.appendChild(chatModal);
    }

    // Wypełniamy kontener nowoczesnym UI
    chatModal.innerHTML = `
        <!-- Nagłówek czatu -->
        <div style="background: white; padding: 15px 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 10;">
            <button onclick="document.getElementById('dynamic-chat-modal').style.display='none'" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0;">⬅️</button>
            <img src="${avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color, #eee);">
            <div style="flex-grow: 1;">
                <b style="font-size: 16px; color: var(--text-color, #2d3436); display: block;">${name}</b>
                <span style="font-size: 11px; color: var(--text-muted, #636e72); font-weight: 700;">Online</span>
            </div>
        </div>

        <!-- Miejsce na wiadomości -->
        <div id="chat-messages-container" style="flex-grow: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
            <div style="text-align: center; color: var(--text-muted, #636e72); font-size: 12px; margin-top: 20px;">
                To jest początek Twojej rozmowy z ${name} 🐾
            </div>
            <!-- Tu Firebase będzie wstrzykiwał wiadomości (loadMessages) -->
        </div>

        <!-- Pole wpisywania -->
        <div style="background: white; padding: 15px; box-shadow: 0 -4px 15px rgba(0,0,0,0.05); display: flex; gap: 10px; align-items: center;">
            <input type="text" id="chat-message-input" placeholder="Napisz wiadomość..." style="flex-grow: 1; padding: 12px 20px; border-radius: 100px; border: 1px solid var(--border-color, #eee); outline: none; font-size: 15px; font-family: 'Nunito', sans-serif;">
            <button onclick="alert('Tu wepniemy sendMessage z Firebase!')" style="background: var(--primary, #34ace0); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 10px rgba(52, 172, 224, 0.3);">
                <span style="font-size: 18px; margin-left: -2px;">🚀</span>
            </button>
        </div>
    `;
    
    // Pokaż modal
    chatModal.style.display = 'flex';
};

// Globalna funkcja otwierająca listę wszystkich rozmów (Inbox z górnego paska)
window.Waggle.openInbox = () => {
    let inboxModal = document.getElementById('dynamic-inbox-modal');
    
    if (!inboxModal) {
        inboxModal = document.createElement('div');
        inboxModal.id = 'dynamic-inbox-modal';
        inboxModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bg-color, #f4f6f9); z-index:999998; display:none; flex-direction:column;";
        document.body.appendChild(inboxModal);
    }

    inboxModal.innerHTML = `
        <div style="background: white; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <b style="font-size: 20px; font-weight: 900; color: var(--text-color, #2d3436);">Rozmowy</b>
            <button onclick="document.getElementById('dynamic-inbox-modal').style.display='none'" style="background: none; border: none; font-size: 22px; cursor: pointer;">✕</button>
        </div>
        <div id="inbox-list-container" style="flex-grow: 1; overflow-y: auto; padding: 15px;">
            <!-- Tu Firebase będzie renderował listę ostatnich czatów -->
            <p style="text-align: center; color: var(--text-muted, #879296); margin-top: 40px; font-weight: 700;">Wczytywanie skrzynki odbiorczej...</p>
        </div>
    `;
    
    inboxModal.style.display = 'flex';
};
