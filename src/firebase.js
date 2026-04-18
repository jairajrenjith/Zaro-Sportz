// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyB4bqvC9lsrAp0Z5NgJVV48ZxOyeGV0ttw',
  authDomain: 'zaro-sportz.firebaseapp.com',
  databaseURL: 'https://zaro-sportz-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'zaro-sportz',
  storageBucket: 'zaro-sportz.firebasestorage.app',
  messagingSenderId: '954928420518',
  appId: '1:954928420518:web:04f560d1d66731f963c667',
  measurementId: 'G-LJ6BZV8QF6',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
