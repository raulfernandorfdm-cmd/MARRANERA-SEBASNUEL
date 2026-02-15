import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_APIKEY",
  authDomain: "PEGA_AQUI.firebaseapp.com",
  projectId: "PEGA_AQUI",
  storageBucket: "PEGA_AQUI.appspot.com",
  messagingSenderId: "PEGA_AQUI",
  appId: "PEGA_AQUI",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
``
