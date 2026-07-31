import firebase from "firebase/compat/app";

export function log(unit: string, message: string, showSnackbar: (message: string) => void): void {
    console.log(unit + ": " + message);
    showSnackbar(message);
}