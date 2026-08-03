import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import {auth} from './firebaseConfig';
import {collection, loadDocument, removeImage, saveDocument, uploadImage} from "@/lib/database";
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

export async function updateProfile(name: string, photoUrl: string | null) {
    const userId = getCurrentUser()!.uid;

    const currentProfile = await readProfile();
    const oldPhotoUrl = currentProfile?.photoUrl ?? null;

    let firebaseImageUrl: string | null = oldPhotoUrl;

    if (photoUrl && !photoUrl.startsWith("https")) {
        try {
            await removeImage(oldPhotoUrl);
        } catch (error) {
            console.log("Failed to remove old profile image: " + error);
        }
        const timestamp = Date.now();
        const storagePath = `users/${userId}/profile_${timestamp}.jpg`;
        firebaseImageUrl = await uploadImage(photoUrl, storagePath);
    } else if (photoUrl === null && oldPhotoUrl) {
        try {
            await removeImage(oldPhotoUrl);
        } catch (error) {
            console.log("Failed to remove old profile image: " + error);
        }
        firebaseImageUrl = null;
    }

    await saveDocument(collection(`users/${userId}/data`), "public", { name: name, photoUrl: firebaseImageUrl });
}

export async function readProfile(userId: string = getCurrentUser().uid): Promise<Profile | null> {
    if (!userId) return null;
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

export async function verifyPassword(password: string): Promise<boolean> {
    const user = getCurrentUser();
    if (!user || !user.email) return false;

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
        await reauthenticateWithCredential(user, credential);
        return true;
    } catch (error: any) {
        if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            return false;
        }
        throw error; // network errors, too-many-requests, etc. — real failures, not "wrong password"
    }
}