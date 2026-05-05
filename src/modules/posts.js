import { db } from '../core/firebase.js';
import { addListener } from '../core/state.js';

export function loadPosts() {
    // Pobieramy tylko 20 ostatnich postów, żeby nie zawiesić telefonu
    const unsub = db.collection("posts")
        .orderBy("timestamp", "desc")
        .limit(20)
        .onSnapshot(snap => {
            let html = "";
            snap.forEach(doc => {
                const p = doc.data();
                const imgTag = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; border-radius:12px; margin-top:10px;">` : "";
                
                html += `
                    <div class="post-card" style="background:var(--panel-bg); margin:15px; border-radius:24px; padding:20px; box-shadow:var(--soft-shadow);">
                        <b style="font-size:16px;">${p.author}</b>
                        <p style="margin:8px 0; font-size:14px;">${p.content}</p>
                        ${imgTag}
                    </div>
                `;
            });
            document.getElementById('posts-container').innerHTML = html || "<p style='text-align:center; padding:20px;'>Brak postów.</p>";
        });

    addListener(unsub);
}
