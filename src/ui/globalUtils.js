// src/ui/globalUtils.js

export function initGlobalUtils() {
    window.Waggle = window.Waggle || {};

    // Globalny system powiadomień Toast [cite: 78, 79, 80, 81, 82]
    window.Waggle.showToast = (msg) => {
        let t = document.getElementById('waggle-toast'); [cite: 78]
        if(!t) { [cite: 79]
            t = document.createElement('div'); t.id = 'waggle-toast'; [cite: 79]
            t.style.cssText = 'position:fixed; bottom:110px; left:50%; transform:translateX(-50%); background:#2d3436; color:#fff; padding:12px 24px; border-radius:25px; font-size:14px; font-weight:800; z-index:10000; border:2px solid var(--primary); transition:opacity 0.3s; text-align:center;'; [cite: 80]
            document.body.appendChild(t); [cite: 80]
        } [cite: 81]
        t.innerText = msg; t.style.display = 'block'; t.style.opacity = '1'; [cite: 81]
        setTimeout(() => { t.style.opacity = '0'; setTimeout(()=>t.style.display='none',300); }, 3500); [cite: 82]
    };

    // Globalny podgląd zdjęć (Lightbox) [cite: 84]
    window.Waggle.openLightbox = (url) => {
        const img = document.getElementById('lightbox-img'); [cite: 84]
        const modal = document.getElementById('lightbox-modal'); [cite: 84]
        if(img && modal) { img.src = url; modal.style.display = 'flex'; } [cite: 84]
    };
}
