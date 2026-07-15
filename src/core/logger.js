// src/core/logger.js
export const DEBUG = true; // Zmienimy na false przed wydaniem na produkcję!

export const Logger = {
    info: (context, message, data = '') => {
        if (DEBUG) console.log(`🔵 [INFO][${context}] ${message}`, data);
    },
    warn: (context, message, data = '') => {
        if (DEBUG) console.warn(`🟠 [WARN][${context}] ${message}`, data);
    },
    error: (context, message, error = '') => {
        // Błędy wyświetlamy zawsze, nawet jeśli DEBUG jest false
        console.error(`🔴 [ERROR][${context}] ${message}`, error); 
    },
    firebase: (message, data = '') => {
        if (DEBUG) console.log(`🔥 [FIREBASE] ${message}`, data);
    },
    safe: (message, data = '') => {
        if (DEBUG) console.log(`🚨 [SAFE] ${message}`, data);
    }
};
