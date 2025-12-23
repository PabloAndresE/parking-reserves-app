import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { app } from './firebase';

const auth = getAuth(app);

export async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Return user object with role
    return {
        ...userCredential.user,
        role: userData.role || 'user'
    };
}

export async function logout() {
    return signOut(auth);
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}
