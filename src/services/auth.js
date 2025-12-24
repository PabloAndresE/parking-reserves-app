import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    try {
        await signOut(auth);
        // Clear all auth-related data
        localStorage.removeItem('parking_user');
        sessionStorage.clear();
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return false;
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function register(email, password, displayName) {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with display name
        await updateProfile(user, { displayName });

        // Send verification email
        await sendEmailVerification(user);

        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName,
            role: 'user',
            createdAt: new Date().toISOString(),
            emailVerified: false
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return { 
            success: true, 
            user: userData,
            message: '¡Registro exitoso! Por favor verifica tu correo electrónico.'
        };
    } catch (error) {
        console.error('Error during registration:', error);
        let errorMessage = 'Error al registrar el usuario. Inténtalo de nuevo.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este correo electrónico ya está en uso.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'El correo electrónico no es válido.';
        }
        
        return { success: false, error: errorMessage };
    }
}
