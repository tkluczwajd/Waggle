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

    // Pobieramy wszystkich użytkowników z bazy
    const usersSnapshot = await admin.firestore().collection("users").get();
    const tokens = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;

      // 🔥 KRYTYCZNA ZMIANA: Sprawdzamy, czy użytkownik ma token ORAZ czy nie wyciszył powiadomień (pushEnabled)
      if (userId !== authorId && userData.fcmToken && userData.pushEnabled === true) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("[Push] Brak aktywnych tokenów (lub wszyscy wyciszyli). Przerywam wysyłkę.");
      return null;
    }

// Budujemy paczkę powiadomienia
    const payload = {
      notification: {
        title: "🚨 Nowy Alert w okolicy!",
        body: `Ktoś zgłosił: ${alertData.type || "Ważne zdarzenie"}. Sprawdź mapę Waggle!`,
      },
      data: {
        type: "NEW_ALERT",
        alertId: context.params.alertId,
        lat: String(alertData.lat || ""),
        lng: String(alertData.lng || ""),
        url: "/" 
      }
    };

    // Wysyłamy do wszystkich naraz
    try {
      const message = {
          ...payload,
          tokens: tokens
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[Push] Sukces: ${response.successCount}, Błędy: ${response.failureCount}`);
    } catch (error) {
      console.error("[Push] Błąd krytyczny podczas wysyłania:", error);
    }

    return null;
  });
