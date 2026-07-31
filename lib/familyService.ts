import {addDocument, collection, loadCollection, loadDocument, saveDocument, uploadImage} from "@/lib/database";
import {Family, Product} from "@/lib/types";
import * as Auth from '@/lib/auth';
import {arrayUnion, deleteField} from 'firebase/firestore';

function generateFamilyCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 to avoid confusion
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export async function createFamilyInDatabase(name: string, maxAttempts = 5): Promise<Family> {
    const userId = Auth.getCurrentUser()!.uid;
    const users = collection('users');
    const families = collection('families');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateFamilyCode();
        try {
            await saveDocument(families, code, {
                name,
                weekStartDay: "Sunday",
                shoppingDays: ["Thursday"],
                weekProducts: []
            });

            // Family doc created successfully — link the user to it
            await saveDocument(users, userId, { familyCode: code });

            return {
                id: code,
                name: name,
                weekStartDay: "Sunday",
                shoppingDays: ["Thursday"],
                allProducts: [],
                weekProducts: []
            };
        } catch (err: any) {
            if (err.code === 'permission-denied') continue;
            throw err;
        }
    }
    throw new Error('Could not generate a unique family code. Please try again.');
}

export async function loadFamilyFromDatabase(): Promise<Family> {
    const userId = Auth.getCurrentUser()!.uid;
    const users = collection('users');
    const families = collection('families');

    // 1. Get the user's own family code
    const userData = await loadDocument(users, userId);
    const code = userData?.familyCode;

    if (!code) {
        throw new Error('You are not in a family.');
    }

    // 2. Load the family document itself
    const familyData = await loadDocument(families, code);

    if (!familyData) {
        // User's own doc points to a family that no longer exists — clean up
        await saveDocument(users, userId, { familyCode: deleteField() });
        throw new Error(`No family found with code "${code}".`);
    }

    // 3. Load the products subcollection for this family
    const productsColl = collection(`families/${code}/allProducts`);
    const productDocs = await loadCollection(productsColl);

    const allProducts: Product[] = productDocs.map(({ id, data }) => ({
        id,
        familyId: code,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        addedByUserId: data.addedByUserId,
        addedByName: data.addedByName,
        isRecurring: data.isRecurring ?? false,
        isChecked: data.isChecked ?? false,
    }));

    // 4. Resolve weekProductIds -> actual Product objects from allProducts
    const weekProductIds: string[] = familyData.weekProductIds ?? [];
    const weekProducts: Product[] = allProducts.filter(p => weekProductIds.includes(p.id));

    return {
        id: code,
        name: familyData.name,
        weekStartDay: familyData.weekStartDay,
        shoppingDays: familyData.shoppingDays ?? [],
        allProducts,
        weekProducts,
    };
}

export async function joinFamilyFromDatabase(code: string): Promise<Family> {
    const userId = Auth.getCurrentUser()!.uid;
    const users = collection('users');

    // 1. Tentatively set the family code on the user's own doc
    await saveDocument(users, userId, { familyCode: code });

    // 2. Try to load it — loadFamily reads the user's own familyCode,
    //    which we just set to `code`, so this checks that exact family.
    try {
        return await loadFamilyFromDatabase();
    } catch (err: any) {
        // Revert so the user isn't left pointing at a bad code
        await saveDocument(users, userId, { familyCode: deleteField() });
        throw new Error(`No family found with code "${code}".`);
    }
}

export async function isUserInFamily(): Promise<boolean> {
    const user = Auth.getCurrentUser();
    if (!user) return false;

    const users = collection('users');
    const userData = await loadDocument(users, user.uid);

    return !!userData?.familyCode;
}

export async function addProductToDatabase(
    family: Family,
    name: string,
    description: string,
    imageUrl: string | null,
    isRecurring: boolean
): Promise<Product> {
    const user = Auth.getCurrentUser()!;
    const userId = user.uid;

    // 1. Get user's name
    const users = collection('users');
    const userData = await loadDocument(users, userId);
    const addedByName = userData?.name ?? user.displayName ?? 'Unknown';

    // 2. Process and upload product photo to firebase storage
    let firebaseImageUrl: string | null = null;
    if (imageUrl)
        firebaseImageUrl = await uploadImage(imageUrl, family.id);

    // 3. Create product's document
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData = {
        name: name,
        description: description,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        isRecurring: isRecurring,
        isChecked: false,
    };

    const productId = await addDocument(productsColl, newProductData);

    // 4. Update weekProducts
    const families = collection('families');
    await saveDocument(families, family.id, {
        weekProducts: arrayUnion(productId),
    });

    // 5. Return product
    return {
        id: productId,
        familyId: family.id,
        name: name,
        description: description,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        addedByName: addedByName,
        isRecurring: isRecurring,
        isChecked: false
    };
}