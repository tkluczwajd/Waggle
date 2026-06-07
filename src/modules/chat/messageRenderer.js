// src/modules/chat/messageRenderer.js

export function renderChatMessages(messages, currentUid, isGroupChat = false) {
    let html = "";
    const isGroup = isGroupChat; 

    messages.forEach(msg => {
        const isMine = msg.sender === currentUid;
        const time = msg.time ? new Date(msg.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : "";
        
        let contentHtml = msg.imageUrl ? `<img src="${msg.imageUrl}" style="width:100%; border-radius:12px; margin-bottom:6px; display:block; cursor:pointer;" onclick="window.Waggle.openLightbox('${msg.imageUrl}')">` : "";
        if(msg.text) contentHtml += `<div style="word-break: break-word;">${msg.text}</div>`;
        
        const checkmark = isMine ? `<span style="font-size:11px; margin-left:2px; opacity:0.8;">✓</span>` : "";
        const timeHtml = `<div class="chat-time">${time} ${checkmark}</div>`;

        let senderIdentityHtml = "";
        if (isGroup && !isMine) {
            const senderName = msg.senderName || "Piesek";
            const senderAvatar = msg.senderAvatar && msg.senderAvatar.trim() !== "" ? msg.senderAvatar : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150";
            
            // 🔥 POPRAWKA: Dodane zdarzenie onclick, które otwiera kartę profilu psa ze stada
            senderIdentityHtml = `
            <div onclick="window.Waggle.showUserActionModal('${msg.sender}', '${senderName.replace(/'/g, "\\'")}', '${senderAvatar}')" 
                 style="display:flex; align-items:center; gap:6px; margin-bottom:4px; margin-left:4px; cursor:pointer; transition: opacity 0.2s;"
                 onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
                <img src="${senderAvatar}" style="width:18px; height:18px; border-radius:50%; object-fit:cover; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size:11px; font-weight:800; color:var(--text-muted);">${senderName}</span>
            </div>`;
        }

        html += `
            <div style="display: flex; flex-direction: column; align-items: ${isMine ? 'flex-end' : 'flex-start'}; margin-bottom: 14px; width: 100%;">
                ${senderIdentityHtml}
                <div class="chat-bubble ${isMine ? 'mine' : ''}" style="max-width: 78%;">
                    ${contentHtml}
                    ${timeHtml}
                </div>
            </div>`;
    });
    
    const msgBox = document.getElementById('chatMessages');
    if(msgBox) {
        msgBox.innerHTML = html;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}

export function renderChatImagePreviewsUI(images, container) {
    if (images.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'flex';
    container.style.gap = '12px';
    container.style.flexWrap = 'wrap';
    container.style.paddingTop = '10px';
    let html = '';
    images.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        html += `
        <div style="position: relative; display: inline-block; margin-top: 5px;">
            <img src="${url}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 12px; border: 2px solid var(--primary); box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <button onclick="window.Waggle.removeChatImagePreview(${index})" style="position: absolute; top: -8px; right: -8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 0;">✕</button>
        </div>`;
    });
    container.innerHTML = html;
}
