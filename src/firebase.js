import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyDSiGcvSUu_kRu2rRsChm7mxVWxFvpOjuY",
    authDomain: "netflix-clone-3f4da.firebaseapp.com",
    projectId: "netflix-clone-3f4da",
    storageBucket: "netflix-clone-3f4da.appspot.com",
    messagingSenderId: "535140532352",
    appId: "1:535140532352:web:ce5f7d9d05802278386665"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  export { auth };
  export default db;