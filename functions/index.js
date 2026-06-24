const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicjalizacja z uprawnieniami admina
admin.initializeApp();

// ============================================================================
// 1. POWIADOMIENIA O NOWYCH ALERTACH NA MAPIE
// ============================================================================
exports.notifyOnNewAlert = functions.firestore
  .document("alerts/{alertId}")
  .onCreate(async (snap, context) => {
    const alertData = snap.data();
    const authorId = alertData.authorId || "Nieznany";
    
    console.log(`[Push] Nowy alert od ${authorId}: ${alertData.type}`);

    // Krok A: Pobieramy wszystkich użytkowników (wersja MVP - później dodamy filtrowanie po GPS)
    const usersSnapshot = await admin.firestore().collection("users").get();
    const tokens = [];
    const tokensToUserId = {}; // Do ewentualnego czyszczenia nieważnych tokenów

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;

      // Nie wysyłamy powiadomienia do samego autora alertu!
      if (userId !== authorId && userData.fcmToken) {
        // Sprawdzamy czy token to tablica czy zwykły string
        const userTokens = Array.isArray(userData.fcmToken) ? userData.fcmToken : [userData.fcmToken];
        
        userTokens.forEach(token => {
            if (token) {
                tokens.push(token);
                tokensToUserId[token] = userId;
            }
        });
      }
    });

    if (tokens.length === 0) {
      console.log("[Push] Brak aktywnych tokenów. Przerywam wysyłkę.");
      return null;
    }

    // Krok B: Budujemy paczkę powiadomienia
    const payload = {
      notification: {
        title: "🚨 Nowy Alert w okolicy!",
        body: `Ktoś zgłosił: ${alertData.type || "Ważne zdarzenie"}. Sprawdź mapę Waggle!`,
      },
      data: {
        type: "NEW_ALERT",
        alertId: context.params.alertId,
        url: "/" // Gdzie przenieść po kliknięciu
      }
    };

    // Krok C: Wysyłamy powiadomienia używając nowej metody sendEachForMulticast
    try {
      const message = {
          ...payload,
          tokens: tokens
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[Push] Sukces: ${response.successCount}, Błędy: ${response.failureCount}`);

      // Krok D: Czyszczenie starych/nieaktywnych tokenów (np. gdy ktoś odinstalował apkę)
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
            console.log("[Push] Do usunięcia tokeny:", failedTokens);
            // Tu w przyszłości dodamy usuwanie starych tokenów z bazy, żeby jej nie zaśmiecać
        }
      }
    } catch (error) {
      console.error("[Push] Błąd krytyczny podczas wysyłania:", error);
    }

    return null;
  });
