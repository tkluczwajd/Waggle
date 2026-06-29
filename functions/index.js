const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp();
}

// ============================================================================
// 1. POWIADOMIENIA O ALERTACH (MAPA)
// ============================================================================
exports.notifyOnNewAlert = functions.firestore
  .document("alerts/{alertId}")
  .onCreate(async (snap, context) => {
    const alertData = snap.data();
    const authorId = alertData.userId || alertData.authorId || "Nieznany"; 
    
    const usersSnapshot = await admin.firestore().collection("users").get();
    const tokens = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      if (userId !== authorId && userData.fcmToken && userData.pushEnabled === true) {
        tokens.push(userData.fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    const payload = {
      notification: {
        title: "🚨 Nowy Alert w okolicy!",
        body: `Ktoś zgłosił: ${alertData.type || "Ważne zdarzenie"}. Sprawdź mapę!`,
      },
      data: {
        type: "NEW_ALERT",
        lat: String(alertData.lat || ""),
        lng: String(alertData.lng || ""),
        url: "/" 
      }
    };

    try {
      await admin.messaging().sendEachForMulticast({ ...payload, tokens });
    } catch (error) {
      console.error("[Push] Błąd:", error);
    }
    return null;
  });

// ============================================================================
// 2. POWIADOMIENIA KARTY S.A.F.E. - LOKALIZACJA (DATA-ONLY PUSH)
// ============================================================================
exports.notifyOnSafePing = functions.firestore
  .document("safe_reports/{reportId}")
  .onCreate(async (snap, context) => {
    const pingData = snap.data();
    const ownerId = pingData.ownerUid; 
    
    // 🔥 DIAGNOSTYKA START
    console.log(`[SAFE ENGINE] Nowy raport ratunkowy ID: ${context.params.reportId}`);
    console.log(`[SAFE ENGINE] Szukam właściciela o UID: ${ownerId}`);

    if (!ownerId) {
        console.error("[SAFE ENGINE] BŁĄD: Raport nie ma przypisanego ownerUid!");
        return null;
    }

    const userDoc = await admin.firestore().collection("users").doc(ownerId).get();
    console.log(`[SAFE ENGINE] Czy profil właściciela istnieje? ${userDoc.exists}`);
    
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    console.log(`[SAFE ENGINE] Status powiadomień właściciela (pushEnabled): ${userData.pushEnabled}`);
    console.log(`[SAFE ENGINE] Posiada token FCM: ${!!userData.fcmToken}`);

    if (!userData.fcmToken || !userData.pushEnabled) {
        console.log("[SAFE ENGINE] PRZERWANO: Użytkownik wyłączył powiadomienia lub nie ma wygenerowanego tokena FCM.");
        return null;
    }

    const message = {
      token: userData.fcmToken,
      data: {
        type: "SAFE_PING",
        title: "🚑 Karta S.A.F.E: Zlokalizowano psa!",
        body: "Znalazca zeskanował zawieszkę i udostępnił lokalizację. Kliknij, by zobaczyć na mapie!",
        lat: String(pingData.lat || ""),
        lng: String(pingData.lng || "")
      },
      android: { priority: "high" },
      webpush: { headers: { Urgency: "high" } }
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`[SAFE ENGINE] SUKCES! Wysłano ping ratunkowy. FCM Message ID: ${response}`);
      
      // 🔥 Zgodnie z wytycznymi z audytu: Zostawiamy ślad w bazie, że powiadomienie poszło w eter
      await snap.ref.update({ 
          pushSent: true, 
          pushDeliveredAt: admin.firestore.FieldValue.serverTimestamp() 
      });

    } catch (error) {
      console.error("[SAFE ENGINE] KRYTYCZNY BŁĄD WYSYŁANIA FCM:", error);
      
      // Rejestrujemy błąd w raporcie, żeby łatwo było namierzyć problem z konkretnym telefonem
      await snap.ref.update({ 
          pushSent: false, 
          pushError: error.message 
      });
    }
    return null;
  });

// ============================================================================
// 3. POWIADOMIENIA KARTY S.A.F.E. - WIADOMOŚCI (SAFE_MESSAGES)
// ============================================================================
exports.notifyOnSafeMessage = functions.firestore
  .document("safe_messages/{msgId}")
  .onCreate(async (snap, context) => {
    const msgData = snap.data();
    const ownerId = msgData.dogId || msgData.uid || msgData.targetId; 
    
    if (!ownerId) return null;

    const userDoc = await admin.firestore().collection("users").doc(ownerId).get();
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    if (!userData.fcmToken || !userData.pushEnabled) return null;

    const payload = {
      notification: {
        title: "💬 Karta S.A.F.E: Nowa wiadomość!",
        body: `Znalazca Twojego psa wysłał wiadomość: "${msgData.message || "Wejdź w aplikację, aby odczytać."}"`,
      },
      data: {
        type: "SAFE_MESSAGE",
        lat: String(msgData.lat || ""),
        lng: String(msgData.lng || ""),
        url: "/" 
      }
    };

    try {
      await admin.messaging().send({ token: userData.fcmToken, ...payload });
    } catch (error) {
      console.error("[Push SAFE Msg] Błąd:", error);
    }
    return null;
  });
