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
    const tokensToUid = {}; // Słownik do mapowania tokenów na UID użytkowników

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;

      if (userId !== authorId && userData.fcmToken && userData.pushEnabled === true) {
        tokens.push(userData.fcmToken);
        tokensToUid[userData.fcmToken] = userId;
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

    try {
      const message = {
          ...payload,
          tokens: tokens
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[Push] Sukces: ${response.successCount}, Błędy: ${response.failureCount}`);
      
      // 🔥 SYSTEM CZYSZCZENIA BAZY Z MARTWYCH TOKENÓW
      if (response.failureCount > 0) {
        const failedTokensIds = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error.code;
            if (errCode === 'messaging/invalid-registration-token' || errCode === 'messaging/registration-token-not-registered') {
              const failedToken = tokens[idx];
              const failedUid = tokensToUid[failedToken];
              if (failedUid) {
                // Usuwamy zepsuty token, aby nie spowalniał przyszłych wysyłek
                admin.firestore().collection("users").doc(failedUid).update({ fcmToken: admin.firestore.FieldValue.delete() });
                failedTokensIds.push(failedUid);
              }
            }
          }
        });
        if (failedTokensIds.length > 0) console.log(`[Push] Usunięto martwe tokeny dla UID:`, failedTokensIds);
      }

    } catch (error) {
      console.error("[Push] Błąd krytyczny podczas wysyłania:", error);
    }

    return null;
  });

// ============================================================================
// 2. RADAR S.A.F.E - POWIADOMIENIE O NAMIERZENIU PSA Z AKTUALIZACJĄ STATUSU
// ============================================================================
exports.notifyOnSafeReport = functions.firestore
  .document("safe_reports/{reportId}")
  .onCreate(async (snap, context) => {
    const report = snap.data();
    const reportRef = snap.ref;
    
    try {
      // Szukamy właściciela
      const userDoc = await admin.firestore().collection("users").doc(report.ownerUid).get();
      if (!userDoc.exists) {
        console.error(`[SAFE] Brak profilu właściciela: ${report.ownerUid}`);
        return reportRef.update({ status: 'ERROR_NO_USER' });
      }
      
      const userData = userDoc.data();
      if (!userData.fcmToken || userData.pushEnabled === false) {
        console.warn(`[SAFE] Użytkownik ${report.ownerUid} nie ma tokena lub wyciszył powiadomienia`);
        return reportRef.update({ status: 'ERROR_NO_TOKEN' });
      }

      const payload = {
        notification: {
          title: "🚨 S.A.F.E: Zlokalizowano Twojego psa!",
          body: "Ktoś właśnie zeskanował zawieszkę! Kliknij, aby zobaczyć dokładną lokalizację na mapie."
        },
        data: {
          type: "SAFE_REPORT",
          reportId: context.params.reportId,
          lat: String(report.lat),
          lng: String(report.lng),
          url: "/" 
        }
      };

      // Wysyłamy i czekamy na wynik
      await admin.messaging().send({ token: userData.fcmToken, ...payload });
      console.log(`[SAFE] Powiadomienie skutecznie wysłane do ${report.ownerUid}`);
      
      // Zapisujemy potwierdzenie doręczenia (Dzięki temu audyt będzie czysty!)
      return reportRef.update({ status: 'SENT', sentAt: admin.firestore.FieldValue.serverTimestamp() });
      
    } catch (error) {
      console.error("[SAFE] Błąd wysyłania powiadomienia:", error);
      
      // 🔥 Sprzątamy token, jeśli przestał być ważny (ktoś usunął przeglądarkę / wyczyścił dane)
      if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
        console.log(`[SAFE] Usuwam martwy token dla usera ${report.ownerUid}`);
        await admin.firestore().collection("users").doc(report.ownerUid).update({ fcmToken: admin.firestore.FieldValue.delete() });
      }
      
      // Rejestrujemy błąd w raporcie
      return reportRef.update({ status: 'ERROR_FCM', errorDetails: error.message });
    }
  });
