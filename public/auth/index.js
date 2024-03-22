/**B"H
 * 
 * firebase auth rules
 */

import config from "./config.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection
 } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';


const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

export default {
    signInWithGoogle,
    readFromFirestore,
    writeToFirestore,
    db,
    app,
    collection,
    setDoc,
    getDoc,
    doc,
    auth,
    startAll
}

function startAll() {
    // Check if the user is already logged in after page loads
    document.addEventListener("DOMContentLoaded", () => {
        // Listen for authentication state changes
        auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log("User is logged in:", user.displayName);
        } else {
            // User is not signed in, sign them in
            signInWithGoogle();
        }
        });
    });
}
// Google Sign-in
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Logged in as:", user.displayName);
  } catch (error) {
    console.error("Google Sign-in Error:", error);
  }
}


// Firestore database operations
async function writeToFirestore(collectionPath, documentPath, data) {
    try {
      await setDoc(doc(db, collectionPath, documentPath), data);
      console.log("Document written successfully!");
    } catch (error) {
      console.error("Error writing document:", error);
    }
  }
  
  async function readFromFirestore(collectionPath, documentPath) {
    try {
      const docSnap = await getDoc(doc(db, collectionPath, documentPath));
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error reading document:", error);
    }
  }