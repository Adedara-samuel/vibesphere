'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      uid: userCredential.user.uid,
      email,
      username,
      displayName,
      photoURL: '',
      bio: '',
      tribe: [],
      vibingWith: [],
      favorites: [],
      resonanceCount: 0,
      createdAt: new Date(),
      isOnline: true,
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    setUser(newUser);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      const newUser: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        username: result.user.email?.split('@')[0] || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        bio: '',
        tribe: [],
        vibingWith: [],
        favorites: [],
        resonanceCount: 0,
        createdAt: new Date(),
        isOnline: true,
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      setUser(newUser);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const followUser = async (userId: string) => {
    if (!user) return;

    // Add to current user's vibingWith
    await updateDoc(doc(db, 'users', user.uid), {
      vibingWith: arrayUnion(userId)
    });

    // Add to target user's tribe
    await updateDoc(doc(db, 'users', userId), {
      tribe: arrayUnion(user.uid)
    });

    // Update local state
    setUser(prev => prev ? { ...prev, vibingWith: [...prev.vibingWith, userId] } : null);
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    // Remove from current user's vibingWith
    await updateDoc(doc(db, 'users', user.uid), {
      vibingWith: arrayRemove(userId)
    });

    // Remove from target user's tribe
    await updateDoc(doc(db, 'users', userId), {
      tribe: arrayRemove(user.uid)
    });

    // Update local state
    setUser(prev => prev ? { ...prev, vibingWith: prev.vibingWith.filter(id => id !== userId) } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, followUser, unfollowUser }}>
      {children}
    </AuthContext.Provider>
  );
}