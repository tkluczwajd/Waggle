// src/ui/legalManager.js
import { auth, db } from '../core/firebase.js';

export function initLegalManager() {
    window.Waggle = window.Waggle || {};

    // 🔥 TREŚCI PRAWNE (Zoptymalizowane pod Google Play Data Safety)
    const LEGAL_TEXTS = {
        terms: `
            <h3 style="margin-top:0;">Regulamin Aplikacji WAGGLE</h3>
            <p><b>1. Postanowienia ogólne</b><br>WAGGLE to platforma społecznościowa dla właścicieli psów, służąca do śledzenia spacerów, wymiany informacji o miejscach i ostrzegania o zagrożeniach.</p>
            <p><b>2. Moduł SAFE</b><br>Aplikacja umożliwia wygenerowanie kodu QR przypisanego do psa. Znalazca psa po zeskanowaniu kodu może (za własną zgodą) udostępnić swoją lokalizację GPS właścicielowi. System ten służy wyłącznie pomocy w odnalezieniu zwierzęcia.</p>
            <p><b>3. Zasady społeczności</b><br>Użytkownicy zobowiązują się do publikowania rzetelnych informacji (szczególnie w module ostrzeżeń) i zachowania kultury w komunikacji. Treści nieodpowiednie będą usuwane.</p>
            <p><b>4. Usunięcie konta</b><br>Użytkownik ma prawo w dowolnym momencie trwale usunąć swoje konto z poziomu ustawień aplikacji, co skutkuje wykasowaniem danych z bazy.</p>
        `,
        privacy: `
            <h3 style="margin-top:0;">Polityka Prywatności (RODO)</h3>
            <p><b>1. Jakie dane zbieramy? (Zgodnie z Google Play)</b><br>
            • <b>Lokalizacja (GPS):</b> Niezbędna do rysowania tras spacerów, działania radaru SAFE oraz pokazywania pobliskich parków. Nie udostępniamy lokalizacji w czasie rzeczywistym innym użytkownikom (poza alarmami SAFE).<br>
            • <b>Zdjęcia/Aparat:</b> Zbierane wyłącznie, gdy użytkownik dobrowolnie doda zdjęcie psa lub zgłosi zagrożenie (np. zdjęcie powalonego drzewa).<br>
            • <b>Dane konta:</b> Adres e-mail używany do logowania oraz identyfikatory urządzenia (FCM) niezbędne do działania powiadomień push.</p>
            <p><b>2. Kto ma dostęp do danych?</b><br>Dane są bezpiecznie przechowywane na serwerach Google (Firebase) zlokalizowanych na terenie EOG. Część profilu psa (np. imię, rasa, miasto) jest publicznie widoczna dla innych spacerowiczów w aplikacji.</p>
            <p><b>3. Moduł Medyczny (SAFE)</b><br>Dane takie jak alergie, chip, czy przyjmowane leki (podawane opcjonalnie) są przechowywane w celu zapewnienia psu bezpieczeństwa w razie zagubienia.</p>
            <p><b>4. Prawo do zapomnienia</b><br>Usunięcie konta w aplikacji natychmiastowo kasuje powiązane dane osobowe i profilowe z bazy danych.</p>
        `
    };

    // 🔥 WYSKAKUJĄCY MODAL Z DOKUMENTAMI
    window.Waggle.showLegalModal = (type) => {
        let overlay = document.getElementById('legal-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'legal-modal-overlay';
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px;';
            
            const content = document.createElement('div');
            content.style.cssText = 'background:var(--panel-bg); border-radius:20px; padding:25px; width:100%; max-width:400px; max-height:80vh; overflow-y:auto; position:relative; color:var(--text-color); font-size:13px; line-height:1.6;';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = 'position:absolute; top:15px; right:15px; background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);';
            closeBtn.onclick = () => overlay.style.display = 'none';
            
            const textContainer = document.createElement('div');
            textContainer.id = 'legal-text-container';
            
            const acceptBtn = document.createElement('button');
            acceptBtn.className = 'btn-main';
            acceptBtn.innerText = 'Zrozumiałem i wracam';
            acceptBtn.style.cssText = 'width:100%; margin-top:20px;';
            acceptBtn.onclick = () => overlay.style.display = 'none';

            content.appendChild(closeBtn);
            content.appendChild(textContainer);
            content.appendChild(acceptBtn);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
        }
        
        document.getElementById('legal-text-container').innerHTML = LEGAL_TEXTS[type];
        overlay.style.display = 'flex';
    };

    // 🔥 KRYTYCZNE DLA GOOGLE PLAY: Funkcja usuwania konta
    window.Waggle.deleteAccount = async () => {
        if (!auth.currentUser) return;
        
        const confirmDelete = confirm("⚠️ UWAGA! Ta operacja jest nieodwracalna.\n\nCzy na pewno chcesz usunąć swoje konto, profil psa i całą historię?");
        if (!confirmDelete) return;

        if (window.Waggle.showToast) window.Waggle.showToast("Trwa usuwanie konta... ⏳");

        try {
            const uid = auth.currentUser.uid;
            
            // 1. Kasowanie profilu publicznego z bazy
            await db.collection("users").doc(uid).delete();
            
            // 2. Kasowanie z systemu autoryzacji Firebase
            await auth.currentUser.delete();
            
            alert("Konto zostało usunięte. Przykro nam, że odchodzisz! 🐾");
            window.location.reload();

        } catch (error) {
            console.error("Błąd usuwania konta:", error);
            // Częsty wymóg bezpieczeństwa Firebase: jeśli logowanie było dawno, trzeba przelogować przed usunięciem
            if (error.code === 'auth/requires-recent-login') {
                alert("Ze względów bezpieczeństwa wyloguj się, zaloguj ponownie i spróbuj jeszcze raz.");
                window.Waggle.logout();
            } else {
                alert("Wystąpił błąd podczas usuwania. Spróbuj ponownie później.");
            }
        }
    };
}
