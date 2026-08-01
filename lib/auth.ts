import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut} from 'firebase/auth';
import {auth} from './firebaseConfig';
import {collection, loadDocument, saveDocument} from "@/lib/database";
import {DocumentData} from "firebase/firestore";
import {Profile} from "@/lib/types";
import firebase from "firebase/compat/app";
import User = firebase.User;

export function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function updateProfile(name: string, photoUrl: string | null) {
    return saveDocument(collection(`users/${getCurrentUser().uid}/data`), "public", {name: name, photoUrl: photoUrl});
}

export async function readProfile(userId: string = getCurrentUser().uid): Promise<Profile | null> {
    const data: DocumentData = await loadDocument(collection(`users/${userId}/data`), "public");
    if (!data) return null;
    return { name: data.name, photoUrl: data.photoUrl };
}

export function signOut() {
    firebaseSignOut(auth);
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
}