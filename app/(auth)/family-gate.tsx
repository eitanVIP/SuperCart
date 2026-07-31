import React, {useState} from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import {PrimaryButton, TopBar} from "@/lib/components/ui";
import * as Auth from '@/lib/auth';
import {router} from "expo-router";
import {useSnackbar} from "@/context/SnackbarContext";
import {log} from "@/lib/util";
import * as Family from "@/lib/familyService";

export default function FamilyGate() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const { showSnackbar } = useSnackbar();

    Family.isUserInFamily().then(result => {
        if (result) {
            router.push("/(app)");
        }
    }).catch(err => {
        log("Family Gate", err.message, showSnackbar);
    });

    function makeFamily(){
        if (!name) {
            log("Family Gate", "Fill in family name", showSnackbar)
            return;
        }

        setLoading(true);

        Family.isUserInFamily().then(result => {
            if (result) {
                log("Family Gate", "You are already in a family", showSnackbar);
                setLoading(false);
                return;
            }

            Family.createFamilyInDatabase(name).then(newFamily => {
                router.push("/(app)");
            }).catch(err => {
                log("Family Gate", err.message, showSnackbar);
            }).finally(() => {
                setLoading(false);
            });
        }).catch(err => {
            log("Family Gate", err.message, showSnackbar);
            setLoading(false);
        });
    }

    function joinFamily() {
        if (code.length !== 6) {
            log("Family Gate", "Enter a valid six-digit family code", showSnackbar);
            return;
        }

        setLoading(true);

        Family.isUserInFamily().then(result => {
            if (result) {
                log("Family Gate", "You are already in a family", showSnackbar);
                setLoading(false);
                return;
            }

            Family.joinFamilyFromDatabase(code).then(family => {
                router.push("/(app)");
            }).catch(err => {
                log("Family Gate", err.message, showSnackbar);
            }).finally(() => {
                setLoading(false);
            });
        }).catch(err => {
            log("Family Gate", err.message, showSnackbar);
            setLoading(false);
        });
    }

    function signOut() {
        Auth.signOut();
        router.push("/(auth)");
    }

    return (
        <>
            <TopBar title="SuperCart" action="Log out" onAction={signOut} />
            <View style={styles.content}>
                <Text style={styles.title}>Choose your family</Text>
                <Text style={styles.intro}>
                    You need a shared family space before you can start a list.
                </Text>
                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Create a new family</Text>
                    <Text style={styles.panelSub}>Start a new shared shopping list.</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Family name"
                        placeholderTextColor="#88958D"
                        style={styles.input}
                    />
                    <PrimaryButton disabled={loading} label="Create family" onPress={makeFamily} />
                </View>
                <Text style={styles.divider}>OR</Text>
                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Join an existing family</Text>
                    <Text style={styles.panelSub}>
                        Enter the six-digit code from a family member.
                    </Text>
                    <TextInput
                        value={code}
                        onChangeText={(text) => setCode(text.toUpperCase())}
                        placeholder="000000"
                        placeholderTextColor="#88958D"
                        autoCapitalize="characters"
                        maxLength={6}
                        style={[styles.input, styles.code]}
                    />
                    <PrimaryButton disabled={loading} label="Join family" onPress={joinFamily} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F6FAF7" },
    content: { padding: 24 },
    title: { fontSize: 29, fontWeight: "800", color: "#173426", marginTop: 18 },
    intro: { fontSize: 15, lineHeight: 22, color: "#587062", marginTop: 8, marginBottom: 22 },
    panel: {
        backgroundColor: "#FFF",
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E2ECE6",
    },
    panelTitle: { fontSize: 18, fontWeight: "800", color: "#1E382A" },
    panelSub: { fontSize: 13, color: "#6D7F74", marginTop: 4 },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DCE7E0",
        paddingHorizontal: 13,
        color: "#173426",
        fontSize: 15,
        marginTop: 16,
    },
    code: { textAlign: "center", letterSpacing: 6, fontWeight: "800" },
    divider: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1,
        color: "#8A9A90",
        marginVertical: 15,
    },
});
