
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
  phone?: string;
}

interface UserContextType {
  user: AppUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  signOut: () => Promise<void>;
  createAndSignInUser: (profileData: { displayName: string, email: string, phone: string }) => Promise<void>;
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
          // This case can happen if Firestore doc creation fails after auth creation.
          // Fallback to basic info.
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
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

  const createAndSignInUser = async (profileData: { displayName: string, email: string, phone: string }) => {
    const { displayName, email, phone } = profileData;
    const password = '123456'; // Default password

    try {
      // First, try to sign in. This will work if the user already exists.
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        // If the error is that the user is not found, then create the account.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;
                
                // Create a corresponding user profile in Firestore
                const userRef = doc(db, 'users', firebaseUser.uid);
                const newUserProfile = {
                    displayName,
                    email,
                    phone,
                };
                await setDoc(userRef, newUserProfile);
                
                // Manually set the user in state, as onAuthStateChanged might not fire immediately.
                setUser({ uid: firebaseUser.uid, ...newUserProfile });
            } catch (createError) {
                // Handle errors during creation (e.g., email already in use by another flow)
                console.error("Error creating user after sign-in failed:", createError);
                throw createError;
            }
        } else {
            // Re-throw other sign-in errors (e.g., wrong password, network issues)
            console.error("Sign-in error:", error);
            throw error;
        }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const value = { user, isLoading, isInitialized, signOut, createAndSignInUser };

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
