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
import {db, storage} from './firebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';
import {Image} from 'react-native';
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

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

export async function uploadImage(
    localUri: string,
    familyId: string
): Promise<string> {
    const getImageSize = (uri: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            Image.getSize(
                uri,
                (width, height) => resolve({ width, height }),
                (error) => reject(error)
            );
        });
    };

    // 1. Get original image dimensions for center-cropping
    const { width, height } = await getImageSize(localUri);
    const cropSize = Math.min(width, height);

    // Calculate center crop offsets
    const originX = (width - cropSize) / 2;
    const originY = (height - cropSize) / 2;

    // 2. Center crop -> Resize to 500x500 -> Compress JPEG to 70% quality
    const processedImage = await ImageManipulator.manipulateAsync(
        localUri,
        [
            { crop: { originX, originY, width: cropSize, height: cropSize } },
            { resize: { width: 500, height: 500 } },
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 3. Convert image URI to Blob for Firebase Storage
    const response = await fetch(processedImage.uri);
    const blob = await response.blob();

    // 4. Set storage path: {familyId}/product_image_{local_timestamp}.jpg
    const timestamp = Date.now();
    const storagePath = `${familyId}/product_image_${timestamp}.jpg`;
    const storageRef = ref(storage, storagePath);

    // 5. Upload file and get public download URL
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
}