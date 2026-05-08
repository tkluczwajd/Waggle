import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = { 
    apiKey: "AIzaSyA7CSlyOLzbz2LpO0C-KqaZQ0U_OrNqBcg", 
    authDomain: "waggle-app-31ffa.firebaseapp.com", 
    projectId: "waggle-app-31ffa", 
    storageBucket: "waggle-app-31ffa.firebasestorage.app", 
    messagingSenderId: "711707392068", 
    appId: "1:711707392068:web:b81c7e0714cfe24dd1e411" 
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const fb = firebase;
