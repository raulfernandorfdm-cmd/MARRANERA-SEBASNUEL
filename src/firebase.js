import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB100c64z1C9EcBHi9NUK-C-qOu3n0ftWY",
  authDomain: "marranera-sebasnuel.firebaseapp.com",
  projectId: "marranera-sebasnuel",
  storageBucket: "marranera-sebasnuel.firebasestorage.app",
  messagingSenderId: "262344078710",
  appId: "1:262344078710:web:375259fface100c1a93657",
  measurementId: "G-4836FTLYCY",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos (Firestore)
export const db = getFirestore(app);
