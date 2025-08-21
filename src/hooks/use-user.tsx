
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User as FirebaseUser
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UserContextType {
  user: AppUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profileData: { displayName: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userSnap.data()
          } as AppUser);
        } else {
          // This case might happen if Firestore doc creation fails after auth creation
          // We'll create it here just in case.
          const newUserProfile = { displayName: null, email: firebaseUser.email };
          await setDoc(userRef, newUserProfile);
          setUser({ uid: firebaseUser.uid, ...newUserProfile });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // If user doesn't exist, create a new account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            // Create a corresponding user profile in Firestore
            const userRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userRef, {
                displayName: null, // Initially null
                email: firebaseUser.email,
            });
        } else {
            // Re-throw other errors (like wrong password)
            throw error;
        }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateUserProfile = async (profileData: { displayName: string }) => {
    if (!user) throw new Error("No user is signed in to update.");
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, profileData, { merge: true });
        setUser(prevUser => prevUser ? { ...prevUser, ...profileData } : null);
    } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
    }
  };


  const value = { user, isLoading, isInitialized, signIn, signOut, updateUserProfile };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
