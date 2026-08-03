import {
    addDocument,
    collection,
    deleteDocument,
    loadCollection,
    loadDocument,
    removeImage,
    saveDocument,
    uploadImage
} from "@/lib/database";
import {Family, Product, ProductDatabase} from "@/lib/types";
import * as Auth from '@/lib/auth';
import {readProfile} from '@/lib/auth';
import {arrayRemove, arrayUnion, deleteField} from 'firebase/firestore';

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
    const userDataCollection = collection(`users/${userId}/data`);
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
            await saveDocument(userDataCollection, "private", { familyCode: code });

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
    const userDataCollection = collection(`users/${userId}/data`);

    // 1. Tentatively set the family code on the user's own private doc
    await saveDocument(userDataCollection, "private", { familyCode: code });

    // 2. Try to load it — loadFamily reads the user's own familyCode,
    //    which we just set to `code`, so this checks that exact family.
    try {
        return await loadFamilyFromDatabase();
    } catch (err: any) {
        // Revert so the user isn't left pointing at a bad code
        await saveDocument(userDataCollection, "private", { familyCode: deleteField() });
        throw new Error(`No family found with code "${code}". Error: ${err}`);
    }
}

export async function isUserInFamily(): Promise<boolean> {
    const user = Auth.getCurrentUser();
    if (!user) return false;

    const userData = await loadDocument(collection(`users/${user.uid}/data`), "private");

    return !!userData?.familyCode;
}

export async function updateFamilyInDatabase(
    family: Family,
    name: string,
    weekStartDay: string
): Promise<Family> {
    await saveDocument(collection('families'), family.id, {
        name: name,
        weekStartDay: weekStartDay,
    });

    return {
        ...family,
        name: name,
        weekStartDay: weekStartDay,
    };
}

export async function leaveFamilyInDatabase(): Promise<void> {
    const userId = Auth.getCurrentUser()!.uid;
    const userDataCollection = collection(`users/${userId}/data`);

    await saveDocument(userDataCollection, "private", { familyCode: deleteField() });
}

export async function addProductToDatabase(
    family: Family,
    name: string,
    description: string,
    count: number,
    imageUrl: string | null,
    isRecurring: boolean
): Promise<Family> {
    const user = Auth.getCurrentUser()!;
    const userId = user.uid;

    // 1. Get user's name
    const profile = await readProfile();
    const addedByName = profile && profile.name ? profile.name : 'Unknown';

    // 2. Process and upload product photo to firebase storage
    let firebaseImageUrl: string | null = null;
    if (imageUrl) {
        const timestamp = Date.now();
        const storagePath = `${family.id}/product_image_${timestamp}.jpg`;
        firebaseImageUrl = await uploadImage(imageUrl, storagePath);
    }

    // 3. Create product's document
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData: ProductDatabase = {
        name: name,
        description: description,
        count: count,
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

    // 5. Build new product, then return family with it added
    const newProduct: Product = {
        id: productId,
        name: name,
        description: description,
        count: count,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        addedByName: addedByName,
        isRecurring: isRecurring,
        isChecked: false,
    };

    return {
        ...family,
        allProducts: [...family.allProducts, newProduct],
        weekProducts: [...family.weekProducts, newProduct],
    };
}

export async function addProductToThisWeekInDatabase(
    family: Family,
    product: Product,
): Promise<Family> {
    const userId = Auth.getCurrentUser()!.uid;

    // Update addedByUserId
    await saveDocument(collection(`families/${family.id}/allProducts`), product.id, {
        addedByUserId: userId,
    });

    // Add product to this week
    await saveDocument(collection('families'), family.id, {
        weekProducts: arrayUnion(product.id),
    });

    const updatedProduct: Product = {
        ...product,
        addedByUserId: userId,
    };

    return {
        ...family,
        allProducts: family.allProducts.map(item =>
            item.id === product.id ? updatedProduct : item
        ),
        weekProducts: [...family.weekProducts, updatedProduct],
    };
}

export async function updateProductInDatabase(
    family: Family,
    product: Product,
    name: string,
    description: string,
    count: number,
    imageUrl: string | null,
    isRecurring: boolean
): Promise<Family> {
    const user = Auth.getCurrentUser()!;
    const userId = user.uid;

    // 1. Get user's name
    const profile = await readProfile();
    const addedByName = profile && profile.name ? profile.name : 'Unknown';

    let firebaseImageUrl: string | null = imageUrl;
    // Only remove and reupload image if given imageUrl is from phone and not from database (if image is from database the user didn't change the image)
    if (!imageUrl.startsWith("https")) {
        // 2. Remove current product photo
        try {
            await removeImage(product.imageUrl);
        } catch (error) {
            console.log("Failed to remove old product image: " + error);
            console.log(product);
        }

        // 3. Process and upload product photo to firebase storage
        if (imageUrl) {
            const timestamp = Date.now();
            const storagePath = `${family.id}/product_image_${timestamp}.jpg`;
            firebaseImageUrl = await uploadImage(imageUrl, storagePath);
        }
    }

    // 4. Change product's document
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData: ProductDatabase = {
        name: name,
        description: description,
        count: count,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        isRecurring: isRecurring,
        isChecked: product.isChecked,
    };

    await saveDocument(productsColl, product.id, newProductData);

    // 5. Build updated product, then return family with it swapped in
    const updatedProduct: Product = {
        id: product.id,
        name: name,
        description: description,
        count: count,
        imageUrl: firebaseImageUrl,
        addedByUserId: userId,
        addedByName: addedByName,
        isRecurring: isRecurring,
        isChecked: product.isChecked,
    };

    return {
        ...family,
        allProducts: family.allProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ),
        weekProducts: family.weekProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ),
    };
}

export async function toggleProductInDatabase(
    family: Family,
    product: Product
): Promise<Family> {
    const productsColl = collection(`families/${family.id}/allProducts`);

    const newProductData: ProductDatabase = {
        name: product.name,
        description: product.description,
        count: product.count,
        imageUrl: product.imageUrl,
        addedByUserId: product.addedByUserId,
        isRecurring: product.isRecurring,
        isChecked: !product.isChecked,
    };

    await saveDocument(productsColl, product.id, newProductData);

    const updatedProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description,
        count: product.count,
        imageUrl: product.imageUrl,
        addedByUserId: product.addedByUserId,
        addedByName: product.addedByName,
        isRecurring: product.isRecurring,
        isChecked: !product.isChecked,
    };

    return {
        ...family,
        allProducts: family.allProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ),
        weekProducts: family.weekProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ),
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

        const newProduct: Product = {
            id: docId,
            name: productDatabase.name,
            description: productDatabase.description,
            count: productDatabase.count,
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

export async function deleteProductInDatabase(family: Family, product: Product, deleteUltimately: boolean): Promise<Family> {
    // Remove week products' properties
    await saveDocument(collection(`families/${family.id}/allProducts`), product.id, {
        count: 1,
        isRecurring: false,
        addedByUserId: null,
        isChecked: false
    })

    // Remove product from this week
    await saveDocument(collection('families'), family.id, {
        weekProducts: arrayRemove(product.id),
    });

    if (deleteUltimately) {
        // Remove product forever
        const allProductsCol = collection(`families/${family.id}/allProducts`);
        await deleteDocument(allProductsCol, product.id);
    }

    const newProduct: Product = {
        ...product,
        count: 1,
        isRecurring: false,
        addedByUserId: "",
        isChecked: false
    };

    return {
        ...family,
        allProducts: deleteUltimately
            ? family.allProducts.filter(p => p.id !== product.id)
            : family.allProducts.map(item => item.id === product.id ? newProduct : item),
        weekProducts: family.weekProducts.filter(p => p.id !== product.id),
    };
}