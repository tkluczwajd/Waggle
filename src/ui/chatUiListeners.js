import { searchUsers, sendMessage, sendChatImage, loadInbox } from '../modules/chat/chatListeners.js';
import { appState as state } from '../core/state.js';

export function initChatUi() {
    document.addEventListener('input', (e) => { 
        if (e.target.id === 'userSearchInput' || e.target.id === 'chatSearchInput') searchUsers(e.target.value); 
    });

    document.addEventListener('click', async (e) => {
        if (e.target.closest('#chatAddPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => {
                state.pendingChatFile = file; 
                const preview = document.getElementById('chat-preview-box') || document.getElementById('chat-preview-container');
                if (preview) {
                    preview.style.display = 'block';
                    preview.innerHTML = `<div style="display:inline-block; position:relative; margin-top:10px;"><img src="${URL.createObjectURL(file)}" style="height:60px; border-radius:12px; border:2px solid var(--primary); object-fit:cover;"><span style="position:absolute; top:-8px; right:-8px; background:var(--danger); color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; cursor:pointer;" onclick="state.pendingChatFile=null; this.parentElement.parentElement.style.display='none'">✕</span></div>`;
                }
            });
        }
        if (e.target.closest('#chatTabSearch')) {
            document.getElementById('inbox-container').style.display = 'none'; document.getElementById('chat-search-view').style.display = 'block';
            document.getElementById('chatTabSearch').style.cssText = 'background-color:#2d3436; color:#ffffff; border-radius:20px;';
            document.getElementById('chatTabInbox').style.cssText = 'background-color:transparent; color:var(--text-muted);';
            window.Waggle.executeSearch(''); 
        }
        if (e.target.closest('#chatTabInbox')) {
            document.getElementById('inbox-container').style.display = 'block'; document.getElementById('chat-search-view').style.display = 'none';
            document.getElementById('chatTabInbox').style.cssText = 'background-color:#2d3436; color:#ffffff; border-radius:20px;';
            document.getElementById('chatTabSearch').style.cssText = 'background-color:transparent; color:var(--text-muted);';
            loadInbox();
        }
        if (e.target.closest('#sendMessageBtn') || e.target.closest('#sendMsgBtn')) {
            const input = document.getElementById('chatInput'); const text = input?.value.trim();
            if(state.pendingChatFile) { await sendChatImage(state.pendingChatFile); state.pendingChatFile = null; document.getElementById('chat-preview-container').innerHTML = ''; }
            if(text) { sendMessage(text); input.value = ''; }
        }
    });
}
