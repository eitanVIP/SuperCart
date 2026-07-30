import firebase from "firebase/compat/app";
import {Product, ProductValues} from "@/lib/types";
import User = firebase.User;

export function log(unit: string, message: string, showSnackbar: (message: string) => void): void {
    console.log(unit + ": " + message);
    showSnackbar(message);
}

export function createProduct({familyId, user, ...values}: ProductValues & { familyId: string; user: User }): Product {
    return {
        id: "0",
        familyId,
        name: values.name,
        description: values.description || "",
        imageUrl: values.imageUrl || null,
        addedByUserId: user.id,
        addedByName: user.name,
        isRecurring: values.isRecurring,
        isChecked: false,
        createdAt: new Date().toISOString(),
    };
}