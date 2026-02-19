import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "marranera-sebasnuel.firebaseapp.com",
  projectId: "marranera-sebasnuel",
  storageBucket: "marranera-sebasnuel.appspot.com",
  messagingSenderId: "262344078710",
  appId: "1:262344078710:web:375259fface100c1a93657",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
