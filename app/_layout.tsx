// import React, { useState } from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { AuthScreen } from "./screens/AuthScreen";
// import { FamilyGateScreen } from "./screens/FamilyGateScreen";
// import { MainApp } from "./screens/MainApp";
//
// export default function SuperCart() {
//     const [session, setSession] = useState(null);
//     const [family, setFamily] = useState(null);
//
//     const screen = !session ? (
//         <AuthScreen onAuthenticated={setSession} />
//     ) : !family ? (
//         <FamilyGateScreen onFamilySelected={setFamily} onLogout={() => setSession(null)} />
//     ) : (
//         <MainApp
//             session={session}
//             family={family}
//             onLogout={() => {
//                 setSession(null);
//                 setFamily(null);
//             }}
//             onLeaveFamily={() => setFamily(null)}
//         />
//     );
//     return <SafeAreaProvider>{screen}</SafeAreaProvider>;
// }

import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider style={styles.container}>
            <AuthProvider>
                <Slot />
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6FAF7",
    },
});