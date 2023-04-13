import "./App.css";
import React, { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FcGoogle } from 'react-icons/fc'
import { GoSignOut } from "react-icons/go";
import fire_chat from "./assets/fire_chat_icon.png";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Developer Chat Messenger 💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <div className="app_icon">
        <img src={fire_chat} alt="app_icon" />
      </div>
      <div className="google_container">
        <button className="google_btn" onClick={signInWithGoogle}>
          Sign in <FcGoogle className="google_icon" />
        </button>
      </div>
      <p className="disclaim">
        <strong> Disclaimer:</strong> Please be mindful of the community
        guidelines while using this chat application. We want to ensure that
        everyone can have a pleasant experience in our shared chatroom. Let's
        keep the conversations respectful and friendly for all.
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out <GoSignOut className="signout_icon" />
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder=" type a message..."
        />
        <button type="submit" disabled={!formValue}>
          <FiSend />
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message: { text, uid, photoURL } }) {
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={photoURL || `https://robohash.org/${uid}?set=set3`}
          alt="profile-pic"
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
