import { auth, db } from './firebase.js';

// Słownik błędów Firebase na język polski
function translateAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email': return "Niepoprawny format adresu e-mail.";
        case 'auth/user-disabled': return "Konto zostało zablokowane.";
        case 'auth/user-not-found': return "Nie znaleziono użytkownika z tym adresem.";
        case 'auth/wrong-password': return "Błędne hasło.";
        case 'auth/invalid-credential': return "Błędny e-mail lub hasło.";
        case 'auth/email-already-in-use': return "Ten adres e-mail jest już zajęty.";
        case 'auth/weak-password': return "Hasło jest za słabe (min. 6 znaków).";
        case 'auth/missing-password': return "Wpisz hasło.";
        default: return "Wystąpił błąd autoryzacji. Spróbuj ponownie.";
    }
}

export function initAuthListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const resetBtn = document.getElementById('resetPasswordBtn'); // Nasz nowy przycisk

    // LOGOWANIE
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            
            if (!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło! 🐾");
            window.Waggle.showToast("Logowanie... ⏳");
            
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => { window.Waggle.showToast("Zalogowano pomyślnie! 🐕"); })
                .catch((error) => {
                    const errorMsg = translateAuthError(error.code);
                    window.Waggle.showToast(`Błąd: ${errorMsg}`);
                });
        });
    }

    // REJESTRACJA
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const email = document.getElementById('authEmail').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const termsChecked = document.getElementById('legalTerms')?.checked;

            if (!termsChecked) return window.Waggle.showToast("Musisz zaakceptować regulamin! 📜");
            if (!email || !pass) return window.Waggle.showToast("Wpisz e-mail i hasło! 🐾");
            
            window.Waggle.showToast("Tworzenie konta... ⏳");
            
            auth.createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    // Tworzymy pusty profil w Firestore po rejestracji
                    db.collection("users").doc(userCredential.user.uid).set({
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    window.Waggle.showToast("Konto utworzone! Witaj w Stadzie! 🎉");
                })
                .catch((error) => {
                    const errorMsg = translateAuthError(error.code);
                    window.Waggle.showToast(`Błąd: ${errorMsg}`);
                });
        });
    }

    // 🔥 RESET HASŁA
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const email = document.getElementById('authEmail').value.trim();
            if (!email) {
                return window.Waggle.showToast("Wpisz swój e-mail wyżej, aby zresetować hasło! 📧");
            }
            
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    window.Waggle.showToast("Link do resetu hasła wysłany na e-mail! 📬");
                })
                .catch((error) => {
                    const errorMsg = translateAuthError(error.code);
                    window.Waggle.showToast(`Błąd: ${errorMsg}`);
                });
        });
    }
}
