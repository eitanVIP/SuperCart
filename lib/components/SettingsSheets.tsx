import React, {useEffect, useState} from "react";
import {useTheme} from "@/theme/ThemeContext";
import {BottomSheet, Field, PrimaryButton} from "@/lib/components/ui";
import {Alert, Image, Pressable, StyleSheet, Text, View} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Auth from '@/lib/auth';

export function ProfileSheet({ visible, profile, onCloseSheet, onSave }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState(profile?.name ?? "");
    const [password, setPassword] = useState("");
    const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? null);

    useEffect(() => {
        setName(profile?.name ?? "");
        setPhotoUrl(profile?.photoUrl ?? null);
    }, [profile]);

    function pickFromLibrary() {
        ImagePicker.requestMediaLibraryPermissionsAsync().then(perm => {
            if (!perm.granted) {
                Alert.alert("Permission needed", "Allow photo library access to choose a picture.");
                return;
            }
            ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            }).then(result => {
                if (!result.canceled && result.assets?.[0]) {
                    setPhotoUrl(result.assets[0].uri);
                }
            });
        });
    }

    function pickFromCamera() {
        ImagePicker.requestCameraPermissionsAsync().then(perm => {
            if (!perm.granted) {
                Alert.alert("Permission needed", "Allow camera access to take a picture.");
                return;
            }
            ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            }).then(result => {
                if (!result.canceled && result.assets?.[0]) {
                    setPhotoUrl(result.assets[0].uri);
                }
            });
        });
    }

    function choosePhoto() {
        Alert.alert("Change photo", undefined, [
            { text: "Take photo", onPress: pickFromCamera },
            { text: "Choose from library", onPress: pickFromLibrary },
            { text: "Cancel", style: "cancel" },
        ]);
    }

    function onClose() {
        setPassword("");
        setName(profile?.name ?? "")
        setPhotoUrl(profile?.photoUrl ?? null);
        onCloseSheet();
    }

    function handleSave() {
        if (!name) {
            Alert.alert("Name required", "Please enter a name.");
            return;
        }
        if (!password) {
            Alert.alert("Password required", "Enter your password to confirm changes.");
            return;
        }

        onSave({ name: name, photoUrl: photoUrl }, password);
        onClose();
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={styles.title}>Edit profile</Text>

            <Pressable onPress={choosePhoto} style={styles.avatarWrap}>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={staticStyles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                            {name ? name[0].toUpperCase() : "?"}
                        </Text>
                    </View>
                )}
                <Text style={styles.avatarLabel}>Change photo</Text>
            </Pressable>

            <Field
                label="NAME"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
            />

            <View style={{ opacity: 0.6 }}>
                <Field
                    label="EMAIL"
                    value={Auth.getCurrentUser().email ?? ""}
                    editable={false}
                />
            </View>

            <Field
                label="PASSWORD"
                placeholder="Confirm with your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={{height: 48}} />

            <PrimaryButton
                label="Save"
                onPress={handleSave}
            />
        </BottomSheet>
    );
}

const DAYS = [
    { value: "Sunday", label: "Sun" },
    { value: "Monday", label: "Mon" },
    { value: "Tuesday", label: "Tue" },
    { value: "Wednesday", label: "Wed" },
    { value: "Thursday", label: "Thu" },
    { value: "Friday", label: "Fri" },
    { value: "Saturday", label: "Sat" },
];

export function FamilySheet({ visible, family, onCloseSheet, onSave, onLeave }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [name, setName] = useState(family?.name ?? "");
    const [weekStartDay, setWeekStartDay] = useState(family?.weekStartDay ?? 'Sunday');

    useEffect(() => {
        setName(family?.name ?? "");
        setWeekStartDay(family?.weekStartDay ?? 'Sunday');
    }, [family]);

    function onClose() {
        setName(family?.name ?? "");
        setWeekStartDay(family?.weekStartDay ?? 'Sunday');
        onCloseSheet();
    }

    function handleSave() {
        if (!name) {
            Alert.alert("Name required", "Please enter a family name.");
            return;
        }

        onSave(name, weekStartDay);
        onClose();
    }

    function handleLeave() {
        Alert.alert(
            "Leave family",
            "You'll lose access to this family's shared list. This can't be undone from here.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", style: "destructive", onPress: () => { onLeave(); onClose(); } },
            ]
        );
    }

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <Text style={styles.title}>Manage family</Text>

            <Field
                label="FAMILY NAME"
                placeholder="Family name"
                value={name}
                onChangeText={setName}
            />

            <View style={styles.codeBlock}>
                <Text style={styles.codeLabel}>FAMILY CODE</Text>
                <Text style={styles.code}>{family?.id ?? "------"}</Text>
                <Text style={styles.codeHint}>Share this code so others can join.</Text>
            </View>

            <Text style={styles.fieldLabel}>WEEK STARTS ON</Text>
            <View style={styles.dayRow}>
                {DAYS.map((day) => (
                    <Pressable
                        key={day.value}
                        onPress={() => setWeekStartDay(day.value)}
                        style={[
                            styles.dayOption,
                            weekStartDay === day.value && styles.dayOptionActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                weekStartDay === day.value && styles.dayTextActive,
                            ]}
                        >
                            {day.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={{ height: 24 }} />

            <PrimaryButton
                label="Save"
                onPress={handleSave}
            />

            <Pressable onPress={handleLeave} style={styles.leave}>
                <Text style={styles.leaveText}>Leave family</Text>
            </Pressable>
        </BottomSheet>
    );
}

const staticStyles = StyleSheet.create({
    avatar: { width: 84, height: 84, borderRadius: 42 },
});

const createStyles = (colors) =>
    StyleSheet.create({
        title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 18 },
        avatarWrap: { alignItems: "center", marginBottom: 20 },
        avatarPlaceholder: {
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        avatarInitial: { fontSize: 32, fontWeight: "800", color: colors.onPrimary },
        avatarLabel: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 8 },
        codeBlock: {
            backgroundColor: colors.primaryLighter,
            borderRadius: 14,
            padding: 15,
            marginTop: 16,
            alignItems: "center",
        },
        codeLabel: {
            fontSize: 10,
            letterSpacing: 1.1,
            fontWeight: "800",
            color: colors.textMuted,
        },
        code: {
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: 4,
            color: colors.primary,
            marginTop: 6,
        },
        codeHint: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 6,
            textAlign: "center",
        },
        fieldLabel: {
            fontSize: 10,
            letterSpacing: 1.1,
            fontWeight: "800",
            color: colors.textMuted,
            marginTop: 20,
            marginBottom: 8,
        },
        dayRow: { flexDirection: "row", gap: 6 },
        dayOption: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderLight,
            alignItems: "center",
        },
        dayOptionActive: {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
        },
        dayText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
        dayTextActive: { color: colors.primaryDark },
        leave: {
            height: 53,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.danger,
            backgroundColor: colors.dangerLight,
        },
        leaveText: { color: colors.danger, fontWeight: "800", fontSize: 15 },
    });