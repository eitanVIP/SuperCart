import {
    addDoc,
    collection as fsCollection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    setDoc,
} from 'firebase/firestore';
import {db} from './firebaseConfig';

export function collection(name: string): CollectionReference<DocumentData> {
    return fsCollection(db, name);
}

export async function loadDocument(
    coll: CollectionReference<DocumentData>,
    id: string
): Promise<DocumentData | null> {
    const snap = await getDoc(doc(coll, id));
    return snap.exists() ? snap.data() : null;
}

export async function saveDocument(
    coll: CollectionReference<DocumentData>,
    id: string,
    data: DocumentData
): Promise<void> {
    await setDoc(doc(coll, id), data, { merge: true });
}

export async function addDocument(
    coll: CollectionReference<DocumentData>,
    data: DocumentData
): Promise<string> {
    const ref = await addDoc(coll, data);
    return ref.id;
}

export async function loadCollection(
    coll: CollectionReference<DocumentData>
): Promise<{ id: string; data: DocumentData }[]> {
    const snap = await getDocs(coll);
    return snap.docs.map(d => ({ id: d.id, data: d.data() }));
}

export async function deleteDocument(
    coll: CollectionReference<DocumentData>,
    id: string
): Promise<void> {
    await deleteDoc(doc(coll, id));
}