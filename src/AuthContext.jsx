import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, createUserProfile } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            online: true,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );

        // Mark user as offline when they disconnect
        window.addEventListener('beforeunload', async () => {
          await setDoc(
            userDocRef,
            {
              online: false,
              lastSeen: serverTimestamp(),
            },
            { merge: true }
          );
        });
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userDocRef,
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
    return signOut(auth);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout, // Added logout here
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
