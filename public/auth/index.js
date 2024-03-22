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

window.db=db;
window.app=app;
window.doc=doc;
window.setDoc=setDoc;
window.getDoc=getDoc;
window.collection=collection;
window.writeToFirestore=writeToFirestore
window.readFromFirestore=readFromFirestore

function startAll() {
    var name = prompt("What is your (nick) name?");
    if(name) {
        alert("Great! Enjoy");
        var sessionId = "BH_"+Date.now()+"_session"
        writeToFirestore("names", "sessions", sessionId, name, {
            sessionId,
            name
        }).then(r=>{
            console.log("Wrote!",r)
        }).catch(e => {
            console.log("No")
        })
    }
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
async function writeToFirestore(...pathSegments) {
    try {
      var seg = pathSegments.slice(0, pathSegments.length-1)
      var data = pathSegments[pathSegments.length - 1]
      // Write data to Firestore
      await setDoc(doc(db, ...seg), data);
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