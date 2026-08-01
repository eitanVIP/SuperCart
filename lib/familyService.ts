import {
    addDocument,
    collection,
    loadCollection,
    loadDocument,
    removeImage,
    saveDocument,
    uploadImage
} from "@/lib/database";
import {Family, Product, ProductDatabase} from "@/lib/types";
import * as Auth from '@/lib/auth';
import {readProfile} from '@/lib/auth';
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
    const families = collection('families');
    const userDataCollection = collection(`users/${userId}/data`);

    // 1. Get the user's own family code
    const userData = await loadDocument(userDataCollection, "private");
    const code = userData?.familyCode;

    if (!code) {
        throw new Error('You are not in a family.');
    }

    // 2. Load the family document itself
    const familyData = await loadDocument(families, code);

    if (!familyData) {
        // User's own doc points to a family that no longer exists — clean up
        await saveDocument(userDataCollection, "private", { familyCode: deleteField() });
        throw new Error(`No family found with code "${code}".`);
    }

    // 3. Load the products subcollection for this family
    // const productsColl = collection(`families/${code}/allProducts`);
    // const productDocs = await loadCollection(productsColl);
    //
    // const allProducts: Product[] = productDocs.map(({ id, data }) => ({
    //     id,
    //     familyId: code,
    //     name: data.name,
    //     description: data.description,
    //     imageUrl: data.imageUrl ?? null,
    //     addedByUserId: data.addedByUserId,
    //     addedByName: data.addedByName,
    //     isRecurring: data.isRecurring ?? false,
    //     isChecked: data.isChecked ?? false,
    // }));
    //
    // // 4. Resolve weekProductIds -> actual Product objects from allProducts
    // const weekProductIds: string[] = familyData.weekProductIds ?? [];
    // const weekProducts: Product[] = allProducts.filter(p => weekProductIds.includes(p.id));

    let family: Family = {
        id: code,
        name: familyData.name,
        weekStartDay: familyData.weekStartDay,
        shoppingDays: familyData.shoppingDays ?? [],
        allProducts: null,
        weekProducts: null,
    };

    const { allProducts, weekProducts } = await loadProductsFromDatabase(family);

    family.allProducts = allProducts;
    family.weekProducts = weekProducts;

    return family;
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

    const userData = await loadDocument(collection(`users/${user.uid}/data`), "private");

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
    const profile = await readProfile();
    const addedByName = profile && profile.name ? profile.name : 'Unknown';

    // 2. Process and upload product photo to firebase storage
    let firebaseImageUrl: string | null = null;
    if (imageUrl)
        firebaseImageUrl = await uploadImage(imageUrl, family.id);

    // 3. Create product's document
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData: ProductDatabase = {
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
        name: name,
        description: description,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        addedByName: addedByName,
        isRecurring: isRecurring,
        isChecked: false
    };
}

export async function updateProductInDatabase(
    family: Family,
    product: Product,
    name: string,
    description: string,
    imageUrl: string | null,
    isRecurring: boolean
): Promise<Product> {
    const user = Auth.getCurrentUser()!;
    const userId = user.uid;

    // 1. Get user's name
    const profile = await readProfile();
    const addedByName = profile && profile.name ? profile.name : 'Unknown';

    // 2. Remove current product photo
    try {
        await removeImage(product.imageUrl);
    } catch (error) {
        console.log("Failed to remove old product image: " + error);
        console.log(product);
    }

    // 3. Process and upload product photo to firebase storage
    let firebaseImageUrl: string | null = null;
    if (imageUrl)
        firebaseImageUrl = await uploadImage(imageUrl, family.id);

    // 4. Change product's document
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData: ProductDatabase = {
        name: name,
        description: description,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        isRecurring: isRecurring,
        isChecked: product.isChecked,
    };

    await saveDocument(productsColl, product.id, newProductData);

    // 5. Return product
    return {
        id: product.id,
        name: name,
        description: description,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        addedByName: addedByName,
        isRecurring: isRecurring,
        isChecked: product.isChecked
    };
}

async function loadProductsFromDatabase(family: Family): Promise<{ allProducts: Product[], weekProducts: Product[] }> {
    if (!Auth.getCurrentUser())
        throw new Error('User not logged in');

    const familyData = await loadDocument(collection('families'), family.id);
    const weekProductsIds: string[] = familyData.weekProducts;

    const productsColl = collection(`families/${family.id}/allProducts`);
    const productsDocs = await loadCollection(productsColl);
    const productMap = new Map(productsDocs.map(doc => [doc.id, doc.data as ProductDatabase]));

    const allProducts: Product[] = [];
    const weekProducts: Product[] = [];

    for (const [docId, productDatabase] of productMap) {
        const addedByUserId = productDatabase.addedByUserId;
        const addedByProfile = await readProfile(addedByUserId);
        const addedByName = addedByProfile && addedByProfile.name ? addedByProfile.name : "Unknown";

        const newProduct = {
            id: docId,
            name: productDatabase.name,
            description: productDatabase.description,
            imageUrl: productDatabase.imageUrl,
            isRecurring: productDatabase.isRecurring,
            addedByUserId: addedByUserId,
            addedByName: addedByName,
            isChecked: productDatabase.isChecked
        };

        allProducts.push(newProduct);
        if (weekProductsIds.includes(docId))
            weekProducts.push(newProduct);
    }

    return { allProducts, weekProducts };
}