import { createContext, useContext, useEffect, useState } from "react";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "firebase/auth";
import { get, ref, serverTimestamp, update } from "firebase/database";
import { auth, db, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

function getAuthMessage(error) {
  switch (error?.code) {
    case "auth/popup-blocked":
    case "auth/cancelled-popup-request":
      return "Popup sign-in was blocked, so redirect sign-in will be used instead.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before login finished.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Auth. Add localhost to Authorized domains in Firebase.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled yet in Firebase Authentication.";
    default:
      return error?.message || "Google sign-in failed.";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      setAuthError(getAuthMessage(error));
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        try {
          const userRef = ref(db, `users/${nextUser.uid}`);
          const existingUser = await get(userRef);
          await update(
            userRef,
            {
              uid: nextUser.uid,
              displayName: nextUser.displayName,
              email: nextUser.email,
              photoURL: nextUser.photoURL,
              provider: "google",
              lastLoginAt: serverTimestamp(),
              ...(existingUser.exists() ? {} : { createdAt: serverTimestamp() })
            }
          );
        } catch (error) {
          setAuthError(error.message || "Unable to store the user profile.");
        }
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/cancelled-popup-request"
      ) {
        setAuthError(getAuthMessage(error));
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      setAuthError(getAuthMessage(error));
    }
  };

  const logout = async () => {
    setAuthError("");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, authError, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
