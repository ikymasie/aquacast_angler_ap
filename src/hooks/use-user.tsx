
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  phone: string;
  displayName: string | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (displayName: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// For demonstration, we'll use a hardcoded phone number as the userId.
// In a real app, this would come from Firebase Auth.
const MOCK_USER_ID = '+16505551234';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', MOCK_USER_ID);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({ phone: MOCK_USER_ID, ...userSnap.data() } as User);
        } else {
          // If user doesn't exist, we create a placeholder object.
          // The UI will then trigger the profile creation dialog.
          setUser({ phone: MOCK_USER_ID, displayName: null });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null); // Handle error case
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = async (displayName: string) => {
    if (!user) throw new Error("No user to update.");
    try {
        const userRef = doc(db, 'users', user.phone);
        await setDoc(userRef, { displayName }, { merge: true });
        setUser(prevUser => prevUser ? { ...prevUser, displayName } : null);
    } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
    }
  };

  const value = { user, isLoading, updateUser };

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
