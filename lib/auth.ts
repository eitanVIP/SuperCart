import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import {auth} from './firebaseConfig';

export function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function updateProfile(name: string) {
    return firebaseUpdateProfile(getCurrentUser(), {displayName: name});
}

export function signOut() {
    firebaseSignOut(auth);
}

export function getCurrentUser() {
    return auth.currentUser;
}