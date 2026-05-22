import { setPostFilter, addPostComment, saveCommunityPost } from '../modules/posts/postsListeners.js';
import { uploadImageToService as uploadImage } from '../services/postsService.js';

export function initPostUi() {
    document.addEventListener('change', (e) => {
        if (e.target.id === 'postImageInput') {
            const file = e.target.files[0]; 
            const preview = document.getElementById('post-image-preview'); 
            if (file && preview) {
                const reader = new FileReader(); 
                reader.onload = (ex) => {
                    if(preview.tagName === 'IMG') { preview.src = ex.target.result; preview.style.display = 'block'; } 
                    else { preview.innerHTML = `<img src="${ex.target.result}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-top:10px;">`; }
                }; 
                reader.readAsDataURL(file);
            }
        }
        
        // 🔥 FIX: Odkrywanie kalendarza, gdy klikniesz "Ustawka"
        if (e.target.id === 'isEventCheckbox') {
            const dateInput = document.getElementById('eventDetailsInput');
            if (dateInput) {
                dateInput.style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });

    document.addEventListener('click', async (e) => {
        if (e.target.closest('#addPostBtn')) { const modal = document.getElementById('post-creator-modal'); if(modal) modal.style.display = 'flex'; }
        if (e.target.closest('.top-pill') && e.target.closest('#view-community')) {
            const btn = e.target.closest('.top-pill'); 
            document.querySelectorAll('#view-community .top-pill').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--text-color)'; });
            btn.style.background = 'var(--text-color)'; btn.style.color = 'white';
            const filter = btn.innerText.includes('Wszystko') ? 'all' : (btn.innerText.includes('Ustawki') ? 'events' : (btn.innerText.includes('Alerty') ? 'alerts' : 'info')); 
            setPostFilter(filter);
        }
        if (e.target.closest('#addPhotoBtn')) {
            window.Waggle.selectPhotoSource((file) => {
                const fileInput = document.getElementById('postImageInput');
                if (fileInput) { const dataTransfer = new DataTransfer(); dataTransfer.items.add(file); fileInput.files = dataTransfer.files; fileInput.dispatchEvent(new Event('change', { bubbles: true })); window.Waggle.showToast("Zdjęcie do posta gotowe! 📸"); }
            });
        }
        if (e.target.closest('#publishPostBtn')) {
            const content = document.getElementById('postContent').value; 
            const file = document.getElementById('postImageInput').files[0]; 
            if(!content.trim() && !file) return;
            
            window.Waggle.showToast("Publikuję... ⏳"); 
            let url = file ? await uploadImage(file) : null;
            
            // 🔥 FIX: Pobieranie daty wydarzenia z formularza
            const isEvent = document.getElementById('isEventCheckbox')?.checked;
            const eventDate = isEvent ? document.getElementById('eventDate')?.value : null;

            await saveCommunityPost(content, url, isEvent, eventDate, document.getElementById('isInfoCheckbox')?.checked);
            
            // Czyszczenie modala po publikacji
            document.getElementById('post-creator-modal').style.display = 'none'; 
            document.getElementById('postContent').value = ''; 
            document.getElementById('postImageInput').value = ''; 
            if (document.getElementById('isEventCheckbox')) document.getElementById('isEventCheckbox').checked = false;
            if (document.getElementById('eventDetailsInput')) document.getElementById('eventDetailsInput').style.display = 'none';
            if (document.getElementById('eventDate')) document.getElementById('eventDate').value = '';
            
            window.Waggle.showToast("Opublikowano! 🐾");
        }
        if (e.target.closest('#sendCommentBtn')) { const input = document.getElementById('commentInput'); if (input && input.value.trim()) { addPostComment(input.value); input.value = ''; } }
    });
}
