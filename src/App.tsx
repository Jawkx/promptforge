import { Toaster } from "./components/ui/sonner";
import Editor from "./screens/Editor";
import { useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Firebase Anonymous User UID:", user.uid);
      } else {
        signInAnonymously(auth).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(`Firebase auth error: ${errorCode}`, errorMessage);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Editor />
      <Toaster />
    </>
  );
}

export default App;
