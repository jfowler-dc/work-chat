import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyATVIGQMJJ7E1-5-aMGgWsxqYLbfrOv2Bk",
    authDomain: "proper-chat-6096c.firebaseapp.com",
    databaseURL: "https://proper-chat-6096c-default-rtdb.firebaseio.com",
    projectId: "proper-chat-6096c",
    storageBucket: "proper-chat-6096c.appspot.com",
    messagingSenderId: "875617924435",
    appId: "1:875617924435:web:3d022f8ad560d354ed1da6",
    measurementId: "G-BKWM4664QR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
